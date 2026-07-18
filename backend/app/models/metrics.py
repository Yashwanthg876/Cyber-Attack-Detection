from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, unique=True, index=True, nullable=False) # rf, xgboost, lstm, decision_tree, etc.
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    training_time = Column(Float, nullable=True) # in seconds
    inference_time = Column(Float, nullable=True) # in milliseconds
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
