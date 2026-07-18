import random

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

# Source country codes for geo-simulation
COUNTRIES = ["United States", "China", "Russia", "Germany", "United Kingdom", "Netherlands", "Brazil", "India", "Canada", "Japan"]

def get_threat_intel(attack_type: str) -> dict:
    """Retrieves MITRE details, description, and mitigation steps for an attack type."""
    return MITRE_MAPPING.get(attack_type, MITRE_MAPPING["Benign"])

def simulate_geo_ip(ip_address: str) -> str:
    """Mock GeoIP lookup to return country source details (returns randomized codes for simulation)."""
    if ip_address.startswith("192.168.") or ip_address.startswith("10.") or ip_address.startswith("127."):
        return "Internal Network"
    random.seed(hash(ip_address))
    return random.choice(COUNTRIES)
