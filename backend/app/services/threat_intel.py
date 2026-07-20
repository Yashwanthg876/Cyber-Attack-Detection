import random
import socket
import urllib.parse
import requests
import json
from ..core.config import settings

# Static Threat Intelligence Mapping for MITRE ATT&CK
MITRE_MAPPING = {
    "Benign": {
        "mitre_id": "N/A",
        "mitre_technique": "Normal traffic flow",
        "description": "Legitimate network activity conforming to typical operational baselines.",
        "mitigation": "No threat action required. Continue routine monitoring.",
        "severity": "Low"
    },
    "DoS": {
        "mitre_id": "T1498",
        "mitre_technique": "Network Service Denial of Service",
        "description": "Adversaries may perform Denial of Service attacks to exhaust server resources, preventing legitimate access.",
        "mitigation": "Implement rate limiting on edge firewalls, deploy SYN cookies, and configure traffic shaping policies.",
        "severity": "High"
    },
    "DDoS": {
        "mitre_id": "T1498.001",
        "mitre_technique": "Direct Network Flood Denial of Service",
        "description": "Flooding network endpoints with massive volumes of traffic from multiple distributed hosts to cause total service outage.",
        "mitigation": "Enable upstream ISP scrubbing pools, leverage Web Application Firewalls (WAF), and enforce strict geo-blocking.",
        "severity": "Critical"
    },
    "Brute Force": {
        "mitre_id": "T1110",
        "mitre_technique": "Brute Force Credentials Guessing",
        "description": "Systematic attempts to guess system passwords or keys to establish unauthorized interactive control (e.g., SSH, FTP).",
        "mitigation": "Enforce Multi-Factor Authentication (MFA), deploy fail2ban policies, limit login attempts, and disable password auth for SSH.",
        "severity": "High"
    },
    "Port Scan": {
        "mitre_id": "T1046",
        "mitre_technique": "Network Service Discovery Scan",
        "description": "Probing target host ports to compile active services, operating systems, and versions during active reconnaissance.",
        "mitigation": "Configure intrusion prevention system (IPS) to drop port-scanning sources, implement port knocking, and close unneeded ports.",
        "severity": "Medium"
    },
    "Botnet": {
        "mitre_id": "T1071",
        "mitre_technique": "Application Layer Command and Control (C2)",
        "description": "A compromise indicators beacon indicating that an internal host is communicating with external botnet masters.",
        "mitigation": "Isolate the compromised system from internal networks, clean command binaries, and block external C2 server IPs.",
        "severity": "Medium"
    },
    "Web Attack": {
        "mitre_id": "T1190",
        "mitre_technique": "Exploit Public-Facing Application",
        "description": "Attempts to inject malicious code (SQL injection, Cross-Site Scripting) through web forms or API endpoints to extract data or hijack execution.",
        "mitigation": "Parameterize database queries, enforce Input Sanitization, configure strict Content Security Policies (CSP), and patch web servers.",
        "severity": "Critical"
    },
    "Infiltration": {
        "mitre_id": "T1210",
        "mitre_technique": "Exploitation of Remote Services",
        "description": "Exploitation of internal server bugs or vulnerabilities (like unpatched buffers) to gain local access and execute lateral movements.",
        "mitigation": "Enforce network micro-segmentation, apply immediate security patches to internal libraries, and run vulnerability scans.",
        "severity": "Critical"
    }
}

COUNTRIES = ["United States", "China", "Russia", "Germany", "United Kingdom", "Netherlands", "Brazil", "India", "Canada", "Japan"]

def get_threat_intel(attack_type: str) -> dict:
    """Retrieves MITRE details, description, and mitigation steps for an attack type."""
    return MITRE_MAPPING.get(attack_type, MITRE_MAPPING["Benign"])

def clean_target(target: str) -> str:
    """Extracts raw host or IP from URLs, protocols, and port numbers."""
    target = target.strip()
    if target.startswith("http://") or target.startswith("https://"):
        parsed = urllib.parse.urlparse(target)
        target = parsed.netloc or parsed.path
    if ":" in target and not target.count(":") > 1:
        target = target.split(":")[0]
    return target

def is_private_ip(ip: str) -> bool:
    """Checks if IP is in private RFC1918 or loopback ranges."""
    if ip.startswith("127.") or ip.startswith("10.") or ip.startswith("192.168.") or ip == "localhost":
        return True
    if ip.startswith("172."):
        parts = ip.split(".")
        if len(parts) >= 2 and parts[1].isdigit():
            val = int(parts[1])
            if 16 <= val <= 31:
                return True
    return False

def resolve_target_ip(target: str) -> str:
    """Resolves domain names to IPv4 address."""
    cleaned = clean_target(target)
    try:
        return socket.gethostbyname(cleaned)
    except Exception:
        return cleaned

def simulate_geo_ip(ip_address: str) -> str:
    """Mock GeoIP lookup fallback."""
    if is_private_ip(ip_address):
        return "Internal Network"
    random.seed(hash(ip_address))
    return random.choice(COUNTRIES)

# ========================================================================
# LIVE THREAT INTELLIGENCE API INTEGRATIONS
# ========================================================================

def query_free_geoip(ip_address: str) -> dict:
    """Multi-provider live GeoIP resolution (ip-api.com and ipapi.co)."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AegisSOC/1.0"}
    
    # Provider 1: ip-api.com
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,country,city,isp,as", headers=headers, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success" and data.get("country"):
                return {
                    "country": data.get("country"),
                    "city": data.get("city", "Unknown City"),
                    "isp": data.get("isp", "Unknown Provider"),
                    "asn": data.get("as", "N/A")
                }
    except Exception:
        pass

    # Provider 2: ipapi.co
    try:
        resp = requests.get(f"https://ipapi.co/{ip_address}/json/", headers=headers, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("country_name"):
                return {
                    "country": data.get("country_name"),
                    "city": data.get("city", "Unknown City"),
                    "isp": data.get("org") or data.get("asn", "Unknown Provider"),
                    "asn": data.get("asn", "N/A")
                }
    except Exception:
        pass

    return {}

def query_virustotal_api(ip_address: str) -> dict:
    """Live VirusTotal v3 API query."""
    key = settings.VIRUSTOTAL_API_KEY
    if not key:
        return {"error": "API key missing"}
    
    headers = {"x-apikey": key}
    url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip_address}"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json().get("data", {}).get("attributes", {})
            stats = data.get("last_analysis_stats", {})
            return {
                "status": "success",
                "stats": stats,
                "malicious_count": stats.get("malicious", 0),
                "harmless_count": stats.get("harmless", 0),
                "reputation": data.get("reputation", 0),
                "as_owner": data.get("as_owner", ""),
                "country": data.get("country", "")
            }
        else:
            return {"status": "error", "code": resp.status_code, "msg": resp.text[:100]}
    except Exception as e:
        return {"status": "exception", "msg": str(e)}

def query_abuseipdb_api(ip_address: str) -> dict:
    """Live AbuseIPDB v2 API check query."""
    key = settings.ABUSEIPDB_API_KEY
    if not key:
        return {"error": "API key missing"}

    headers = {"Key": key, "Accept": "application/json"}
    url = f"https://api.abuseipdb.com/api/v2/check?ipAddress={ip_address}&maxAgeInDays=90"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json().get("data", {})
            return {
                "status": "success",
                "abuse_score": data.get("abuseConfidenceScore", 0),
                "total_reports": data.get("totalReports", 0),
                "country": data.get("countryName", ""),
                "isp": data.get("isp", ""),
                "domain": data.get("domain", ""),
                "last_reported": data.get("lastReportedAt", "")
            }
        else:
            return {"status": "error", "code": resp.status_code, "msg": resp.text[:100]}
    except Exception as e:
        return {"status": "exception", "msg": str(e)}

def query_shodan_api(ip_address: str) -> dict:
    """Live Shodan Host Lookup API query."""
    key = settings.SHODAN_API_KEY
    if not key:
        return {"error": "API key missing"}

    url = f"https://api.shodan.io/shodan/host/{ip_address}?key={key}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return {
                "status": "success",
                "ports": data.get("ports", []),
                "vulns": list(data.get("vulns", {}).keys()) if isinstance(data.get("vulns"), dict) else data.get("vulns", []),
                "os": data.get("os", "Unknown"),
                "org": data.get("org", ""),
                "asn": data.get("asn", "")
            }
        else:
            return {"status": "error", "code": resp.status_code, "msg": resp.text[:100]}
    except Exception as e:
        return {"status": "exception", "msg": str(e)}

def query_alienvault_otx(ip_address: str) -> dict:
    """Live AlienVault OTX (Open Threat Exchange) Indicators lookup."""
    key = settings.ALIENVAULT_API_KEY
    headers = {"X-OTX-API-KEY": key} if key else {}
    url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip_address}/general"
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            pulse_info = data.get("pulse_info", {})
            return {
                "status": "success",
                "pulse_count": pulse_info.get("count", 0),
                "pulses": [
                    {"name": p.get("name"), "adversary": p.get("adversary", "Unknown")}
                    for p in pulse_info.get("pulses", [])[:5]
                ]
            }
        else:
            return {"status": "error", "code": resp.status_code, "msg": resp.text[:100]}
    except Exception as e:
        return {"status": "exception", "msg": str(e)}

def lookup_ip_reputation(raw_target: str) -> dict:
    """Unified Live Threat Intelligence Lookup querying VirusTotal, AbuseIPDB, Shodan, AlienVault, and GeoIP."""
    cleaned_host = clean_target(raw_target)
    
    if is_private_ip(cleaned_host):
        return {
            "ip": cleaned_host,
            "reputation": "Clean",
            "score": 0,
            "country": "Internal Network",
            "asn": "LAN Subnet",
            "isp": "Local Area Network",
            "whois": f"Target: {cleaned_host}\nType: Private / RFC1918 Internal Network Address\nStatus: Non-routable on public internet",
            "vt_score": "0 / 0 engines flag (Private Subnet)",
            "details": {}
        }

    # Resolve domain to IPv4 if necessary
    resolved_ip = resolve_target_ip(cleaned_host)

    # Perform multi-source live queries
    geo_res = query_free_geoip(resolved_ip)
    vt_res = query_virustotal_api(resolved_ip)
    abuse_res = query_abuseipdb_api(resolved_ip)
    shodan_res = query_shodan_api(resolved_ip)
    otx_res = query_alienvault_otx(resolved_ip)

    # Combine metrics
    vt_malicious = vt_res.get("malicious_count", 0) if vt_res.get("status") == "success" else 0
    vt_total = (vt_res.get("malicious_count", 0) + vt_res.get("harmless_count", 0)) if vt_res.get("status") == "success" else 0
    abuse_score = abuse_res.get("abuse_score", 0) if abuse_res.get("status") == "success" else 0

    # Classify reputation
    if vt_malicious > 0 or abuse_score >= 50:
        reputation = "Malicious"
        score = max(abuse_score, min(99, vt_malicious * 10))
    elif abuse_score > 0 or (vt_res.get("status") == "error" and vt_res.get("code") != 404):
        reputation = "Suspicious"
        score = max(abuse_score, 40)
    else:
        reputation = "Clean"
        score = 0

    country = (
        geo_res.get("country") or 
        abuse_res.get("country") or 
        vt_res.get("country") or 
        simulate_geo_ip(resolved_ip)
    )

    asn = (
        geo_res.get("asn") or 
        shodan_res.get("asn") or 
        vt_res.get("as_owner") or 
        (abuse_res.get("isp") if abuse_res.get("isp") else "Standard Telecom Provider")
    )

    isp = geo_res.get("isp") or abuse_res.get("isp") or "Unknown Network Provider"

    whois_str = (
        f"Query Target:   {raw_target} (Resolved: {resolved_ip})\n"
        f"ISP/Owner:      {isp}\n"
        f"Location:       {geo_res.get('city', 'Unknown City')}, {country}\n"
        f"Abuse Reports:  {abuse_res.get('total_reports', 0)} incidents logged in last 90 days\n"
        f"Open Ports:     {', '.join(map(str, shodan_res.get('ports', []))) if shodan_res.get('ports') else 'None detected'}\n"
        f"Vulnerabilities:{', '.join(shodan_res.get('vulns', [])) if shodan_res.get('vulns') else 'No known CVEs'}"
    )

    vt_score_str = (
        f"{vt_malicious} / {vt_total} engines flag as malicious"
        if vt_total > 0 else
        (f"AbuseIPDB Confidence Score: {abuse_score}%" if abuse_res.get("status") == "success" else f"Location: {country}")
    )

    return {
        "ip": f"{cleaned_host} ({resolved_ip})" if cleaned_host != resolved_ip else resolved_ip,
        "reputation": reputation,
        "score": score,
        "country": country,
        "asn": asn,
        "isp": isp,
        "whois": whois_str,
        "vt_score": vt_score_str,
        "details": {
            "geoip": geo_res,
            "virustotal": vt_res,
            "abuseipdb": abuse_res,
            "shodan": shodan_res,
            "alienvault": otx_res
        }
    }
