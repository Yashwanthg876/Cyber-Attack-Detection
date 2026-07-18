import os
import joblib
import pandas as pd
import shap

# Constants
FEATURES = [
    "flow_duration", "packet_count", "packet_length_mean",
    "src_port", "dest_port", "protocol_encoded",
    "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
]

def save_shap_explainer():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "data", "models")
    
    # Load Random Forest model
    rf_path = os.path.join(models_dir, "random_forest_model.joblib")
    if not os.path.exists(rf_path):
        raise FileNotFoundError(f"Random Forest model not found at {rf_path}. Run save_rf.py first.")
    
    rf = joblib.load(rf_path)
    
    # Load processed training data to use as background set
    train_df = pd.read_csv(os.path.join(processed_dir, "train_data.csv"))
    X_train = train_df[FEATURES].values
    
    # Use a small background sample (50 rows) for faster local tree calculations
    background_sample = X_train[:50]
    
    print("Building SHAP TreeExplainer on Random Forest model...")
    explainer = shap.TreeExplainer(model=rf, data=background_sample)
    
    explainer_path = os.path.join(models_dir, "shap_explainer.joblib")
    joblib.dump(explainer, explainer_path)
    print(f"SHAP Explainer serialized and saved to: {explainer_path}")

if __name__ == "__main__":
    save_shap_explainer()
