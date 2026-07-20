import random
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

def simulate_geo_ip(ip_address: str) -> str:
    """Mock GeoIP lookup to return country source details."""
    if ip_address.startswith("192.168.") or ip_address.startswith("10.") or ip_address.startswith("127."):
        return "Internal Network"
    random.seed(hash(ip_address))
    return random.choice(COUNTRIES)

# ========================================================================
# LIVE THREAT INTELLIGENCE API INTEGRATIONS
# ========================================================================

def query_virustotal_api(target: str) -> dict:
    """Live VirusTotal v3 API query."""
    key = settings.VIRUSTOTAL_API_KEY
    if not key:
        return {"error": "API key missing"}
    
    headers = {"x-apikey": key}
    url = f"https://www.virustotal.com/api/v3/ip_addresses/{target}"
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

def query_abuseipdb_api(target: str) -> dict:
    """Live AbuseIPDB v2 API check query."""
    key = settings.ABUSEIPDB_API_KEY
    if not key:
        return {"error": "API key missing"}

    headers = {"Key": key, "Accept": "application/json"}
    url = f"https://api.abuseipdb.com/api/v2/check?ipAddress={target}&maxAgeInDays=90"
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

def query_shodan_api(target: str) -> dict:
    """Live Shodan Host Lookup API query."""
    key = settings.SHODAN_API_KEY
    if not key:
        return {"error": "API key missing"}

    url = f"https://api.shodan.io/shodan/host/{target}?key={key}"
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

def query_alienvault_otx(target: str) -> dict:
    """Live AlienVault OTX (Open Threat Exchange) Indicators lookup."""
    key = settings.ALIENVAULT_API_KEY
    headers = {"X-OTX-API-KEY": key} if key else {}
    url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{target}/general"
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

def lookup_ip_reputation(target: str) -> dict:
    """Unified Live Threat Intelligence Lookup querying VirusTotal, AbuseIPDB, Shodan, and AlienVault."""
    vt_res = query_virustotal_api(target)
    abuse_res = query_abuseipdb_api(target)
    shodan_res = query_shodan_api(target)
    otx_res = query_alienvault_otx(target)

    # Combine metrics
    vt_malicious = vt_res.get("malicious_count", 0) if vt_res.get("status") == "success" else 0
    vt_total = (vt_res.get("malicious_count", 0) + vt_res.get("harmless_count", 0)) if vt_res.get("status") == "success" else 0
    abuse_score = abuse_res.get("abuse_score", 0) if abuse_res.get("status") == "success" else 0

    # Classify reputation
    if vt_malicious > 0 or abuse_score >= 50:
        reputation = "Malicious"
        score = max(abuse_score, min(99, vt_malicious * 10))
    elif abuse_score > 0 or vt_res.get("status") == "error":
        reputation = "Suspicious"
        score = max(abuse_score, 40)
    else:
        reputation = "Clean"
        score = 0

    country = (
        abuse_res.get("country") or 
        vt_res.get("country") or 
        simulate_geo_ip(target)
    )

    asn = (
        shodan_res.get("asn") or 
        vt_res.get("as_owner") or 
        (abuse_res.get("isp") if abuse_res.get("isp") else "Standard Telecom Provider")
    )

    whois_str = (
        f"NetRange:       {target.split('.')[0] if '.' in target else target}.0.0.0 - {target.split('.')[0] if '.' in target else target}.255.255.255\n"
        f"ISP/Owner:      {abuse_res.get('isp', 'Unknown ISP')}\n"
        f"Domain:         {abuse_res.get('domain', 'N/A')}\n"
        f"Abuse Reports:  {abuse_res.get('total_reports', 0)} incidents logged in last 90 days\n"
        f"Open Ports:     {', '.join(map(str, shodan_res.get('ports', []))) if shodan_res.get('ports') else 'None detected'}\n"
        f"Vulnerabilities:{', '.join(shodan_res.get('vulns', [])) if shodan_res.get('vulns') else 'No known CVEs'}"
    )

    vt_score_str = (
        f"{vt_malicious} / {vt_total} engines flag as malicious"
        if vt_total > 0 else
        (f"AbuseIPDB Confidence Score: {abuse_score}%" if abuse_res.get("status") == "success" else "Live Threat Feeds Active")
    )

    return {
        "ip": target,
        "reputation": reputation,
        "score": score,
        "country": country,
        "asn": asn,
        "isp": abuse_res.get("isp", "N/A"),
        "whois": whois_str,
        "vt_score": vt_score_str,
        "details": {
            "virustotal": vt_res,
            "abuseipdb": abuse_res,
            "shodan": shodan_res,
            "alienvault": otx_res
        }
    }
