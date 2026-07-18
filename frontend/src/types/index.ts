export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'analyst';
  created_at: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface PredictionHistoryItem {
  id: number;
  timestamp: string;
  flow_duration: number;
  packet_length: number;
  packet_count: number;
  src_port: number;
  dest_port: number;
  protocol: string;
  predicted_class: string;
  confidence: number;
  risk_score: number;
  mitre_technique?: string;
  mitre_id?: string;
}
