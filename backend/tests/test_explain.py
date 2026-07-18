import os
import sys
from sqlalchemy.orm import Session

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.prediction import PredictionHistory
from app.api.explain import get_shap_explanation

def run_test():
    print("Testing Live SHAP calculation pipeline...")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create a mock prediction record for DDoS
        mock_pred = PredictionHistory(
            flow_duration=450000.0,
            packet_count=15,
            packet_length=320.0,
            src_port=49152,
            dest_port=80,
            protocol="TCP",
            flow_bytes_s=12000.0,
            flow_packets_s=33.3,
            active_time=450000.0,
            idle_time=0.0,
            predicted_class="DDoS",
            confidence=0.99,
            risk_score=95,
            severity="Critical",
            mitre_id="T1498.001",
            mitre_technique="Direct Flood DoS",
            mitigation="Leveraging ISP scrubbers."
        )
        db.add(mock_pred)
        db.commit()
        db.refresh(mock_pred)
        
        # Test 1: Fetch explanation for DDoS using prediction ID
        print("Test 1: Querying SHAP for specific prediction ID...")
        res = get_shap_explanation(attack_type="DDoS", prediction_id=mock_pred.id, db=db)
        
        assert "base_value" in res, "Missing base_value in SHAP response"
        assert "prediction_value" in res, "Missing prediction_value in SHAP response"
        assert "top_features" in res, "Missing top_features in SHAP response"
        assert len(res["top_features"]) == 10, f"Expected 10 features, got {len(res['top_features'])}"
        
        print("SHAP Features weights retrieved successfully:")
        for feat in res["top_features"][:3]:
            print(f"  * {feat['feature']}: {feat['weight']:.4f} ({feat['description']})")
            
        print("Test 1: PASSED")
        
        # Clean up
        db.delete(mock_pred)
        db.commit()
        print("Database cleaned up successfully.")
        print("\nAll Live SHAP calculation assertions PASSED successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Test failed with error: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
