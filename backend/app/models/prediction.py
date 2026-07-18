from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Network features
    flow_duration = Column(Float, nullable=False)
    packet_length = Column(Float, nullable=False)
    packet_count = Column(Integer, nullable=False)
    src_port = Column(Integer, nullable=False)
    dest_port = Column(Integer, nullable=False)
    protocol = Column(String, nullable=False)
    flow_bytes_s = Column(Float, nullable=False)
    flow_packets_s = Column(Float, nullable=False)
    active_time = Column(Float, nullable=True)
    idle_time = Column(Float, nullable=True)

    # ML Output
    predicted_class = Column(String, index=True, nullable=False)  # Benign, DoS, DDoS, etc.
    confidence = Column(Float, nullable=False)  # Probability (0.0 to 1.0)
    risk_score = Column(Float, nullable=False)   # Score (0 to 100)
    severity = Column(String, index=True, nullable=False)      # Low, Medium, High, Critical
    
    # MITRE Mapping & Intelligence
    mitre_technique = Column(String, nullable=True)
    mitre_id = Column(String, nullable=True)
    mitigation = Column(String, nullable=True)
    
    # Analytics / GeoIP Cache
    source_country = Column(String, default="Unknown")
    source_ip = Column(String, default="127.0.0.1")
    destination_ip = Column(String, default="127.0.0.1")
