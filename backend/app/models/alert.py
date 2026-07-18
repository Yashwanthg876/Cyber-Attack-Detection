from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, nullable=True) # References PredictionHistory.id
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    attack_type = Column(String, index=True, nullable=False)
    severity = Column(String, index=True, nullable=False) # Critical, High, Medium, Low
    description = Column(String, nullable=False)
    status = Column(String, default="Active", index=True, nullable=False) # Active, Investigating, Resolved, Dismissed
    assigned_to = Column(String, nullable=True) # Analyst name
    resolved_at = Column(DateTime(timezone=True), nullable=True)
