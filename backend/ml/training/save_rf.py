import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Constants
FEATURES = [
    "flow_duration", "packet_count", "packet_length_mean",
    "src_port", "dest_port", "protocol_encoded",
    "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
]
TARGET = "label_encoded"

def save_rf():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "data", "models")
    
    train_df = pd.read_csv(os.path.join(processed_dir, "train_data.csv"))
    X_train = train_df[FEATURES].values
    y_train = train_df[TARGET].values
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    print("Training dedicated Random Forest classifier for ensemble...")
    rf.fit(X_train, y_train)
    
    rf_path = os.path.join(models_dir, "random_forest_model.joblib")
    joblib.dump(rf, rf_path)
    print(f"Random Forest model saved to: {rf_path}")

if __name__ == "__main__":
    save_rf()
