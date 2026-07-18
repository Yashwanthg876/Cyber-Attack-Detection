import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from ..core.config import settings

# Global variables to cache loaded models in memory
_SCALER = None
_LABEL_ENCODER = None
_RF_MODEL = None
_XGB_MODEL = None
_LSTM_MODEL = None

FEATURES = [
    "flow_duration", "packet_count", "packet_length_mean",
    "src_port", "dest_port", "protocol_encoded",
    "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
]

def load_models():
    """Loads and caches all model binaries from storage directories."""
    global _SCALER, _LABEL_ENCODER, _RF_MODEL, _XGB_MODEL, _LSTM_MODEL
    
    models_dir = settings.MODEL_DIR
    
    # Scaler
    scaler_path = os.path.join(models_dir, "scaler.joblib")
    if os.path.exists(scaler_path) and _SCALER is None:
        _SCALER = joblib.load(scaler_path)
        
    # Label Encoder
    encoder_path = os.path.join(models_dir, "label_encoder.joblib")
    if os.path.exists(encoder_path) and _LABEL_ENCODER is None:
        _LABEL_ENCODER = joblib.load(encoder_path)
        
    # Random Forest
    rf_path = os.path.join(models_dir, "random_forest_model.joblib")
    if os.path.exists(rf_path) and _RF_MODEL is None:
        _RF_MODEL = joblib.load(rf_path)
        
    # XGBoost
    xgb_path = os.path.join(models_dir, "xgboost_model.joblib")
    if os.path.exists(xgb_path) and _XGB_MODEL is None:
        _XGB_MODEL = joblib.load(xgb_path)
        
    # LSTM
    lstm_path = os.path.join(models_dir, "lstm_model.keras")
    if os.path.exists(lstm_path) and _LSTM_MODEL is None:
        # Load keras model (preventing threading locks)
        _LSTM_MODEL = tf.keras.models.load_model(lstm_path)
        
    print("All ML/DL models successfully initialized in Aegis Memory Cache.")

def predict_flow(raw_flow: dict) -> dict:
    """
    Evaluates a single network flow dictionary.
    Input dictionary features:
        - flow_duration (float)
        - packet_count (int)
        - packet_length_mean (float)
        - src_port (int)
        - dest_port (int)
        - protocol (str, TCP/UDP/ICMP)
        - flow_bytes_s (float)
        - flow_packets_s (float)
        - active_mean (float)
        - idle_mean (float)
    """
    global _SCALER, _LABEL_ENCODER, _RF_MODEL, _XGB_MODEL, _LSTM_MODEL
    
    # Initialize models if they are not already loaded
    if any(m is None for m in [_SCALER, _LABEL_ENCODER, _RF_MODEL, _XGB_MODEL, _LSTM_MODEL]):
        load_models()
        
    if _SCALER is None or _LABEL_ENCODER is None:
        raise RuntimeError("Preprocessing scaler/encoder assets are missing on the system.")
        
    # Map Protocol name to ID
    protocol_map = {"TCP": 6, "UDP": 17, "ICMP": 1}
    protocol_str = str(raw_flow.get("protocol", "TCP")).upper()
    protocol_encoded = protocol_map.get(protocol_str, 6)
    
    # Format and align features
    features_dict = {
        "flow_duration": float(raw_flow.get("flow_duration", 0)),
        "packet_count": int(raw_flow.get("packet_count", 0)),
        "packet_length_mean": float(raw_flow.get("packet_length_mean", 0)),
        "src_port": int(raw_flow.get("src_port", 0)),
        "dest_port": int(raw_flow.get("dest_port", 0)),
        "protocol_encoded": protocol_encoded,
        "flow_bytes_s": float(raw_flow.get("flow_bytes_s", 0)),
        "flow_packets_s": float(raw_flow.get("flow_packets_s", 0)),
        "active_mean": float(raw_flow.get("active_mean", 0)),
        "idle_mean": float(raw_flow.get("idle_mean", 0)),
    }
    
    # Create pandas DF for scaling (to match fit header shapes)
    df_features = pd.DataFrame([features_dict])
    X_scaled = _SCALER.transform(df_features[FEATURES].values)
    
    # Model 1: Random Forest
    rf_probs = _RF_MODEL.predict_proba(X_scaled)[0]
    
    # Model 2: XGBoost
    xgb_probs = _XGB_MODEL.predict_proba(X_scaled)[0]
    
    # Model 3: LSTM (Deep Learning)
    X_scaled_lstm = X_scaled.reshape((1, 1, len(FEATURES)))
    lstm_probs = _LSTM_MODEL.predict(X_scaled_lstm, verbose=0)[0]
    
    # Weighted voting combination
    # Weights: RF (30%), XGBoost (35%), LSTM (35%)
    w_rf, w_xgb, w_lstm = 0.30, 0.35, 0.35
    ensemble_probs = (w_rf * rf_probs) + (w_xgb * xgb_probs) + (w_lstm * lstm_probs)
    
    class_idx = int(np.argmax(ensemble_probs))
    predicted_class = str(_LABEL_ENCODER.inverse_transform([class_idx])[0])
    confidence = float(ensemble_probs[class_idx])
    
    # Risk score and severity mapping
    severity, base_risk = map_severity_and_risk(predicted_class)
    
    # Scale risk dynamically based on confidence
    if predicted_class == "Benign":
        # Benign confidence scales down the risk score
        risk_score = float(np.clip(base_risk * (1 - confidence), 1, 12))
    else:
        # Threat confidence raises the risk score
        risk_score = float(np.clip(base_risk + (confidence * 15), base_risk, 100))
        
    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "risk_score": round(risk_score, 1),
        "severity": severity,
        "class_probabilities": {
            str(_LABEL_ENCODER.inverse_transform([i])[0]): float(prob)
            for i, prob in enumerate(ensemble_probs)
        }
    }

def map_severity_and_risk(attack_label: str):
    """Maps predicted label to default severity categorizations and base risk scores."""
    if attack_label == "Benign":
        return "Low", 5
    elif attack_label in ["Port Scan", "Botnet"]:
        return "Medium", 45
    elif attack_label in ["DoS", "Brute Force"]:
        return "High", 70
    elif attack_label in ["DDoS", "Web Attack", "Infiltration"]:
        return "Critical", 85
    else:
        return "Medium", 50
