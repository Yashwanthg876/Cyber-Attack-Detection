from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    level = Column(String, index=True, nullable=False)   # INFO, WARNING, ERROR, CRITICAL
    message = Column(String, nullable=False)
    source = Column(String, index=True, nullable=False)  # auth, prediction_engine, database
