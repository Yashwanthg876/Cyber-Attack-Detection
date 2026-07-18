import os
import numpy as np
import pandas as pd

# Define target labels and features in accordance with CICIDS2017 schema
LABELS = ["Benign", "DoS", "DDoS", "Brute Force", "Port Scan", "Botnet", "Web Attack", "Infiltration"]
PROTOCOLS = ["TCP", "UDP", "ICMP"]

def generate_benign_flows(n: int) -> pd.DataFrame:
    """Generates standard web, email, DNS, and database traffic."""
    np.random.seed(42)
    
    # TCP port 80/443, UDP 53, databases 3306/5432
    dest_ports = np.random.choice([80, 443, 53, 3306, 5432, 22], size=n, p=[0.4, 0.35, 0.15, 0.04, 0.04, 0.02])
    src_ports = np.random.randint(1024, 65535, size=n)
    
    protocols = []
    for dp in dest_ports:
        if dp == 53:
            protocols.append("UDP")
        else:
            protocols.append(np.random.choice(["TCP", "UDP"], p=[0.95, 0.05]))

    # Stat distribution
    flow_duration = np.random.exponential(scale=500000, size=n) + 10  # microseconds
    packet_count = np.random.poisson(lam=12, size=n) + 2
    packet_length_mean = np.random.normal(loc=350, scale=120, size=n)
    packet_length_mean = np.clip(packet_length_mean, 40, 1500)
    
    # Bytes and Packets per second calculations
    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    # Active/Idle times
    active_mean = flow_duration * np.random.uniform(0.7, 1.0, size=n)
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Benign"
    })
    return df

def generate_dos_flows(n: int) -> pd.DataFrame:
    """Generates Denial of Service attack profiles (slowloris, hulk - high packet rate, medium packet size)."""
    np.random.seed(43)
    
    dest_ports = np.random.choice([80, 443], size=n)
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = ["TCP"] * n
    
    flow_duration = np.random.normal(loc=8000000, scale=1500000, size=n)  # Long duration
    flow_duration = np.clip(flow_duration, 100000, 15000000)
    packet_count = np.random.poisson(lam=50, size=n) + 20
    packet_length_mean = np.random.normal(loc=120, scale=20, size=n)      # Smaller payloads
    packet_length_mean = np.clip(packet_length_mean, 20, 200)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration * np.random.uniform(0.1, 0.3, size=n)     # Short bursts, long idle times
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "DoS"
    })
    return df

def generate_ddos_flows(n: int) -> pd.DataFrame:
    """Generates Distributed DoS attacks (massive packet count, high bytes/s, tiny durations)."""
    np.random.seed(44)
    
    dest_ports = np.random.choice([80, 443, 53], size=n, p=[0.45, 0.45, 0.1])
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = np.random.choice(["TCP", "UDP"], size=n, p=[0.7, 0.3])
    
    flow_duration = np.random.exponential(scale=1500, size=n) + 1  # Super short duration
    packet_count = np.random.poisson(lam=120, size=n) + 50        # Huge packet count
    packet_length_mean = np.random.normal(loc=1000, scale=200, size=n)   # Large payload sizes
    packet_length_mean = np.clip(packet_length_mean, 500, 1500)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration * 0.99
    idle_mean = np.zeros(n)
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "DDoS"
    })
    return df

def generate_brute_force_flows(n: int) -> pd.DataFrame:
    """Generates SSH/FTP brute forcing (small packet counts, quick attempts)."""
    np.random.seed(45)
    
    dest_ports = np.random.choice([22, 21], size=n, p=[0.7, 0.3])  # SSH or FTP
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = ["TCP"] * n
    
    flow_duration = np.random.normal(loc=2000000, scale=500000, size=n)
    flow_duration = np.clip(flow_duration, 500000, 5000000)
    packet_count = np.random.poisson(lam=22, size=n) + 8
    packet_length_mean = np.random.normal(loc=85, scale=15, size=n)
    packet_length_mean = np.clip(packet_length_mean, 40, 180)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration * np.random.uniform(0.8, 0.95, size=n)
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Brute Force"
    })
    return df

def generate_port_scan_flows(n: int) -> pd.DataFrame:
    """Generates Port Scan traffic (many ports targeted, extremely low durations/packets)."""
    np.random.seed(46)
    
    dest_ports = np.random.randint(1, 1024, size=n)
    src_ports = np.random.randint(40000, 65535, size=n)
    protocols = np.random.choice(["TCP", "UDP"], size=n, p=[0.9, 0.1])
    
    flow_duration = np.random.uniform(low=1, high=500, size=n) # Microseconds
    packet_count = np.random.choice([1, 2], size=n, p=[0.8, 0.2]) # 1-2 packets only
    packet_length_mean = np.random.choice([0, 40], size=n, p=[0.7, 0.3]) # Zero/tiny headers

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration
    idle_mean = np.zeros(n)
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Port Scan"
    })
    return df

def generate_botnet_flows(n: int) -> pd.DataFrame:
    """Generates Botnet traffic (fixed regular intervals, IRC/C2 protocols)."""
    np.random.seed(47)
    
    dest_ports = np.random.choice([6667, 8080, 4444], size=n, p=[0.6, 0.2, 0.2]) # IRC/Alternate ports
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = ["TCP"] * n
    
    flow_duration = np.random.normal(loc=12000000, scale=2000000, size=n)
    flow_duration = np.clip(flow_duration, 5000000, 20000000)
    packet_count = np.random.poisson(lam=15, size=n) + 5
    packet_length_mean = np.random.normal(loc=120, scale=30, size=n)
    packet_length_mean = np.clip(packet_length_mean, 60, 250)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    # Active/Idle times represent regular beacons
    active_mean = flow_duration * np.random.uniform(0.05, 0.15, size=n)
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Botnet"
    })
    return df

def generate_web_attack_flows(n: int) -> pd.DataFrame:
    """Generates SQL Injection / XSS web attacks (medium duration, large packet payloads, targeting 80/443)."""
    np.random.seed(48)
    
    dest_ports = np.random.choice([80, 443], size=n)
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = ["TCP"] * n
    
    flow_duration = np.random.exponential(scale=600000, size=n) + 200
    packet_count = np.random.poisson(lam=18, size=n) + 6
    packet_length_mean = np.random.normal(loc=650, scale=150, size=n) # Larger SQL payloads
    packet_length_mean = np.clip(packet_length_mean, 200, 1400)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration * np.random.uniform(0.85, 0.99, size=n)
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Web Attack"
    })
    return df

def generate_infiltration_flows(n: int) -> pd.DataFrame:
    """Generates internal Infiltration flows (slow lateral movement, high ports)."""
    np.random.seed(49)
    
    dest_ports = np.random.randint(2000, 40000, size=n)
    src_ports = np.random.randint(1024, 65535, size=n)
    protocols = ["TCP"] * n
    
    flow_duration = np.random.normal(loc=15000000, scale=3000000, size=n)
    flow_duration = np.clip(flow_duration, 8000000, 25000000)
    packet_count = np.random.poisson(lam=35, size=n) + 10
    packet_length_mean = np.random.normal(loc=400, scale=100, size=n)
    packet_length_mean = np.clip(packet_length_mean, 100, 1000)

    flow_bytes = packet_count * packet_length_mean
    flow_bytes_s = (flow_bytes / (flow_duration / 1000000.0))
    flow_packets_s = (packet_count / (flow_duration / 1000000.0))
    
    active_mean = flow_duration * np.random.uniform(0.01, 0.05, size=n) # Mostly silent/idle
    idle_mean = flow_duration - active_mean
    
    df = pd.DataFrame({
        "flow_duration": flow_duration,
        "packet_count": packet_count,
        "packet_length_mean": packet_length_mean,
        "src_port": src_ports,
        "dest_port": dest_ports,
        "protocol": protocols,
        "flow_bytes_s": flow_bytes_s,
        "flow_packets_s": flow_packets_s,
        "active_mean": active_mean,
        "idle_mean": idle_mean,
        "label": "Infiltration"
    })
    return df

def make_dataset(output_path: str, size: int = 10000):
    """Assembles all threat groups into a single shuffled CSV file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Establish proportions
    n_benign = int(size * 0.65)
    n_dos = int(size * 0.10)
    n_ddos = int(size * 0.10)
    n_brute = int(size * 0.04)
    n_port = int(size * 0.04)
    n_bot = int(size * 0.03)
    n_web = int(size * 0.02)
    n_infil = int(size * 0.02)
    
    df_benign = generate_benign_flows(n_benign)
    df_dos = generate_dos_flows(n_dos)
    df_ddos = generate_ddos_flows(n_ddos)
    df_brute = generate_brute_force_flows(n_brute)
    df_port = generate_port_scan_flows(n_port)
    df_bot = generate_botnet_flows(n_bot)
    df_web = generate_web_attack_flows(n_web)
    df_infil = generate_infiltration_flows(n_infil)
    
    # Concatenate all classes
    df = pd.concat([
        df_benign, df_dos, df_ddos, df_brute, df_port, df_bot, df_web, df_infil
    ], ignore_index=True)
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    # Handle mathematical infinities or NaNs resulting from divide-by-zero flow durations
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(0, inplace=True)
    
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created: {output_path} (Shape: {df.shape})")

if __name__ == "__main__":
    # Standard location in backend
    dest_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "raw", "network_traffic.csv"
    )
    make_dataset(dest_file, 8000)
    
    # Let's also output a sample test file that can be uploaded by the user to the Detection tab
    test_dest_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "raw", "network_traffic_sample.csv"
    )
    make_dataset(test_dest_file, 100)
    print("Test upload sample created successfully!")
