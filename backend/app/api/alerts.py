from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import List, Optional

from ..core.database import get_db
from ..models.alert import Alert
from ..schemas.predict import FlowPredictionResponse # Re-use response schema if needed

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/")
def list_alerts(
    db: Session = Depends(get_db),
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, High, Medium, Low"),
    status: Optional[str] = Query(None, description="Filter by status: Active, Investigating, Resolved, Dismissed"),
    search: Optional[str] = Query(None, description="Search term in description or attack type"),
    limit: int = Query(50, le=100),
    offset: int = 0
):
    """Lists security alerts with text search and severity/status filters."""
    query = db.query(Alert)
    
    if severity and severity.upper() != "ALL":
        query = query.filter(Alert.severity == severity)
        
    if status:
        query = query.filter(Alert.status == status)
        
    if search:
        query = query.filter(
            or_(
                Alert.attack_type.ilike(f"%{search}%"),
                Alert.description.ilike(f"%{search}%")
            )
        )
        
    total = query.count()
    items = query.order_by(Alert.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": a.id,
                "prediction_id": a.prediction_id,
                "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M:%S") if a.timestamp else None,
                "attack_type": a.attack_type,
                "severity": a.severity,
                "description": a.description,
                "status": a.status,
                "assigned_to": a.assigned_to,
                "resolved_at": a.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if a.resolved_at else None
            }
            for a in items
        ]
    }

@router.post("/{alert_id}/investigate")
def mark_alert_investigating(alert_id: int, db: Session = Depends(get_db)):
    """Sets alert status to 'Investigating'."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert incident not found.")
        
    alert.status = "Investigating"
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} flagged under investigation."}

@router.post("/{alert_id}/resolve")
def mark_alert_resolved(alert_id: int, db: Session = Depends(get_db)):
    """Sets alert status to 'Resolved' and updates timestamp."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert incident not found.")
        
    alert.status = "Resolved"
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as resolved."}
