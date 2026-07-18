from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class FlowPredictionRequest(BaseModel):
    flow_duration: float = Field(..., description="Flow duration in microseconds", example=1500)
    packet_count: int = Field(..., description="Total packet count in flow", example=20)
    packet_length_mean: float = Field(..., description="Average packet size", example=350.5)
    src_port: int = Field(..., description="Source port", example=49152)
    dest_port: int = Field(..., description="Destination port", example=443)
    protocol: str = Field(..., description="Protocol: TCP, UDP, or ICMP", example="TCP")
    flow_bytes_s: float = Field(..., description="Flow bytes per second", example=450000.0)
    flow_packets_s: float = Field(..., description="Flow packets per second", example=120.0)
    active_mean: float = Field(0.0, description="Mean active time in microseconds")
    idle_mean: float = Field(0.0, description="Mean idle time in microseconds")

class FlowPredictionResponse(BaseModel):
    prediction: str = Field(..., description="Predicted class label")
    confidence: float = Field(..., description="Ensemble model classification confidence")
    risk_score: float = Field(..., description="Calculated threat risk score (0 to 100)")
    severity: str = Field(..., description="Low, Medium, High, or Critical threat severity classification")
    class_probabilities: Dict[str, float] = Field(..., description="Raw probability vectors for all classes")

class BatchPredictionResponse(BaseModel):
    total_processed: int
    attacks_detected: int
    risk_average: float
    predictions: List[FlowPredictionResponse]
