import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..models.prediction import PredictionHistory
from ..models.alert import Alert
from ..schemas.predict import FlowPredictionRequest, FlowPredictionResponse, BatchPredictionResponse
from ..services.ensemble import predict_flow
from ..services.threat_intel import get_threat_intel, simulate_geo_ip

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("/", response_model=FlowPredictionResponse)
def evaluate_single_flow(request: FlowPredictionRequest, db: Session = Depends(get_db)):
    """Runs a single network flow log through the Ensemble model and saves to history/alerts."""
    try:
        # Predict using ensemble (RF + XGBoost + LSTM)
        flow_data = request.model_dump()
        result = predict_flow(flow_data)
        
        # Enforce MITRE intelligence mapping
        intel = get_threat_intel(result["prediction"])
        
        # Determine client source IPs for simulation
        src_ip = f"185.{random.randint(10, 250)}.{random.randint(10, 250)}.{random.randint(1, 254)}"
        if result["prediction"] == "Benign":
            src_ip = "192.168.1.105"  # Internal
            
        dest_ip = "10.0.0.45"
        country = simulate_geo_ip(src_ip)
        
        # Save to PredictionHistory
        history = PredictionHistory(
            flow_duration=flow_data["flow_duration"],
            packet_count=flow_data["packet_count"],
            packet_length_mean=flow_data["packet_length_mean"],
            src_port=flow_data["src_port"],
            dest_port=flow_data["dest_port"],
            protocol=flow_data["protocol"],
            flow_bytes_s=flow_data["flow_bytes_s"],
            flow_packets_s=flow_data["flow_packets_s"],
            active_time=flow_data.get("active_mean", 0.0),
            idle_time=flow_data.get("idle_mean", 0.0),
            
            predicted_class=result["prediction"],
            confidence=result["confidence"],
            risk_score=result["risk_score"],
            severity=result["severity"],
            
            mitre_technique=intel["mitre_technique"],
            mitre_id=intel["mitre_id"],
            mitigation=intel["mitigation"],
            
            source_ip=src_ip,
            destination_ip=dest_ip,
            source_country=country
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        
        # If threat detected (not Benign), trigger alert
        if result["prediction"] != "Benign":
            alert = Alert(
                prediction_id=history.id,
                attack_type=result["prediction"],
                severity=result["severity"],
                description=f"AI engine flagged flow as {result['prediction']} with {result['confidence']*100:.1f}% confidence. MITRE technique: {intel['mitre_technique']} ({intel['mitre_id']}).",
                status="Active"
            )
            db.add(alert)
            db.commit()
            
        return FlowPredictionResponse(
            prediction=result["prediction"],
            confidence=result["confidence"],
            risk_score=result["risk_score"],
            severity=result["severity"],
            class_probabilities=result["class_probabilities"]
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction engine pipeline error: {str(e)}")

@router.post("/batch", response_model=BatchPredictionResponse)
def evaluate_batch_flows(requests: List[FlowPredictionRequest], db: Session = Depends(get_db)):
    """Runs a batch upload of flow records (e.g. from a CSV file) and updates the database."""
    predictions = []
    attacks_detected = 0
    total_risk = 0.0
    
    try:
        for req in requests:
            flow_data = req.model_dump()
            result = predict_flow(flow_data)
            intel = get_threat_intel(result["prediction"])
            
            # Simulated variables
            src_ip = f"185.{random.randint(10, 250)}.{random.randint(10, 250)}.{random.randint(1, 254)}"
            if result["prediction"] == "Benign":
                src_ip = "192.168.1." + str(random.choice([101, 102, 103, 104, 105]))
            dest_ip = "10.0.0.45"
            country = simulate_geo_ip(src_ip)
            
            # Save flow history
            history = PredictionHistory(
                flow_duration=flow_data["flow_duration"],
                packet_count=flow_data["packet_count"],
                packet_length_mean=flow_data["packet_length_mean"],
                src_port=flow_data["src_port"],
                dest_port=flow_data["dest_port"],
                protocol=flow_data["protocol"],
                flow_bytes_s=flow_data["flow_bytes_s"],
                flow_packets_s=flow_data["flow_packets_s"],
                active_time=flow_data.get("active_mean", 0.0),
                idle_time=flow_data.get("idle_mean", 0.0),
                
                predicted_class=result["prediction"],
                confidence=result["confidence"],
                risk_score=result["risk_score"],
                severity=result["severity"],
                
                mitre_technique=intel["mitre_technique"],
                mitre_id=intel["mitre_id"],
                mitigation=intel["mitigation"],
                
                source_ip=src_ip,
                destination_ip=dest_ip,
                source_country=country
            )
            db.add(history)
            db.commit()
            db.refresh(history)
            
            # Handle stats
            total_risk += result["risk_score"]
            if result["prediction"] != "Benign":
                attacks_detected += 1
                # Trigger alert
                alert = Alert(
                    prediction_id=history.id,
                    attack_type=result["prediction"],
                    severity=result["severity"],
                    description=f"AI engine flagged batch element as {result['prediction']} ({intel['mitre_id']}) with {result['confidence']*100:.1f}% confidence.",
                    status="Active"
                )
                db.add(alert)
                db.commit()
                
            predictions.append(
                FlowPredictionResponse(
                    prediction=result["prediction"],
                    confidence=result["confidence"],
                    risk_score=result["risk_score"],
                    severity=result["severity"],
                    class_probabilities=result["class_probabilities"]
                )
            )
            
        risk_avg = (total_risk / len(requests)) if requests else 0.0
        return BatchPredictionResponse(
            total_processed=len(requests),
            attacks_detected=attacks_detected,
            risk_average=round(risk_avg, 1),
            predictions=predictions
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch evaluation pipeline error: {str(e)}")
