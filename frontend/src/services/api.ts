const BASE_URL = 'http://localhost:8000/api/v1';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('soc_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Authentication
  async login(payload: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed.');
    }
    return res.json();
  },

  async register(payload: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed.');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile.');
    return res.json();
  },

  // Predictions
  async predictSingle(flowData: any) {
    const res = await fetch(`${BASE_URL}/predict/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(flowData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Evaluation failed.');
    }
    return res.json();
  },

  async predictBatch(flowsList: any[]) {
    const res = await fetch(`${BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(flowsList),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Batch evaluation failed.');
    }
    return res.json();
  },

  // Dashboard Stats
  async getDashboardData() {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend dashboard offline, serving mock stats.');
    }
    return this.getMockDashboardData();
  },

  // Threat Intel Feeds
  async getThreatIntel() {
    try {
      const res = await fetch(`${BASE_URL}/threat-intelligence`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend threat intel offline, serving mock intelligence.');
    }
    return this.getMockThreatIntel();
  },

  // SHAP Explainer
  async getShapExplanation(predictedClass: string) {
    try {
      const res = await fetch(`${BASE_URL}/explain?attack_type=${predictedClass}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('SHAP explainer offline, serving mock SHAP data.');
    }
    return this.getMockShapData(predictedClass);
  },

  // System Logs & Health
  async getSystemHealth() {
    const res = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  // FALLBACK MOCK HANDLERS (for interactive offline representation)
  getMockDashboardData() {
    return {
      metrics: {
        total_packets: 1245892,
        normal_traffic: 1241120,
        attacks_detected: 4772,
        critical_alerts: 8,
        risk_score: 14.5,
        model_accuracy: 99.25,
      },
      traffic_timeline: [
        { time: '08:00', packets: 4200, benign: 4180, malicious: 20 },
        { time: '09:00', packets: 5600, benign: 5540, malicious: 60 },
        { time: '10:00', packets: 8100, benign: 7800, malicious: 300 },
        { time: '11:00', packets: 6200, benign: 6150, malicious: 50 },
        { time: '12:00', packets: 4900, benign: 4890, malicious: 10 },
      ],
      attack_distribution: [
        { name: 'DoS', value: 1840 },
        { name: 'DDoS', value: 2150 },
        { name: 'Port Scan', value: 450 },
        { name: 'Brute Force', value: 220 },
        { name: 'Botnet', value: 80 },
        { name: 'Web Attack', value: 22 },
        { name: 'Infiltration', value: 10 },
      ],
      protocol_distribution: [
        { name: 'TCP', value: 89 },
        { name: 'UDP', value: 9 },
        { name: 'ICMP', value: 2 },
      ],
      recent_alerts: [
        { id: 1, timestamp: '2026-07-18 10:05:42', attack_type: 'DoS', severity: 'High', status: 'Active', description: 'Packet volume spike on port 80.' },
        { id: 2, timestamp: '2026-07-18 09:41:15', attack_type: 'DDoS', severity: 'Critical', status: 'Active', description: 'Syn flood from distributed high ports.' },
        { id: 3, timestamp: '2026-07-18 09:12:04', attack_type: 'Brute Force', severity: 'High', status: 'Investigating', description: 'SSH dictionary attack targeting port 22.' },
        { id: 4, timestamp: '2026-07-18 08:33:55', attack_type: 'Port Scan', severity: 'Medium', status: 'Resolved', description: 'Rapid sequential port probes detected.' },
      ]
    };
  },

  getMockThreatIntel() {
    return {
      feed: [
        { ioc: '194.26.192.45', type: 'IP address', threat: 'Mirai Botnet C2', country: 'Russia', reputation: 'Malicious', references: 'AbuseIPDB, AlienVault' },
        { ioc: '80.82.77.102', type: 'IP address', threat: 'SSH Brute Force scanner', country: 'Netherlands', reputation: 'High Risk', references: 'Shodan, AbuseIPDB' },
        { ioc: '91.240.118.2', type: 'IP address', threat: 'Hulk DoS Agent', country: 'China', reputation: 'Malicious', references: 'AlienVault OTX' },
      ],
      known_vectors: [
        { code: 'T1498', name: 'Denial of Service', tactic: 'Impact', count: 3990 },
        { code: 'T1110', name: 'Brute Force', tactic: 'Credential Access', count: 220 },
        { code: 'T1046', name: 'Network Service Discovery', tactic: 'Reconnaissance', count: 450 },
        { code: 'T1071', name: 'Application Layer Protocol', tactic: 'Command & Control', count: 80 },
      ]
    };
  },

  getMockShapData(attackType: string) {
    // Generate feature importance list based on target class
    if (attackType === 'DDoS') {
      return {
        base_value: 0.12,
        prediction_value: 0.99,
        top_features: [
          { feature: 'flow_packets_s', weight: 0.35, description: 'Extremely high packet transmission rate.' },
          { feature: 'flow_bytes_s', weight: 0.28, description: 'Saturated bandwidth rate.' },
          { feature: 'packet_count', weight: 0.18, description: 'Abnormally high cumulative packet count.' },
          { feature: 'flow_duration', weight: -0.12, description: 'Extremely short connection session lifetimes.' },
        ]
      };
    } else if (attackType === 'DoS') {
      return {
        base_value: 0.05,
        prediction_value: 0.96,
        top_features: [
          { feature: 'idle_mean', weight: 0.42, description: 'Extremely long connection wait times.' },
          { feature: 'flow_duration', weight: 0.28, description: 'Unusually prolonged connection session lifetimes.' },
          { feature: 'packet_length_mean', weight: -0.15, description: 'Relatively small header payload packet size.' },
        ]
      };
    } else if (attackType === 'Port Scan') {
      return {
        base_value: 0.04,
        prediction_value: 0.94,
        top_features: [
          { feature: 'flow_duration', weight: 0.38, description: 'Microsecond level flow session lifetimes.' },
          { feature: 'dest_port', weight: 0.31, description: 'Reconnaissance scans probing low system ports.' },
          { feature: 'packet_count', weight: -0.18, description: 'Minimal transmission (typically 1-2 packets only).' },
        ]
      };
    }
    
    // Default / Benign
    return {
      base_value: 0.85,
      prediction_value: 0.95,
      top_features: [
        { feature: 'packet_length_mean', weight: 0.12, description: 'Standard payload dimensions.' },
        { feature: 'dest_port', weight: 0.08, description: 'Targeting standard HTTP/HTTPS channels (80/443).' },
        { feature: 'flow_duration', weight: 0.05, description: 'Conforms to regular service interaction schedules.' },
      ]
    };
  }
};
