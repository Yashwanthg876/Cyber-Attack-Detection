import os
import time
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

# Constants
FEATURES = [
    "flow_duration", "packet_count", "packet_length_mean",
    "src_port", "dest_port", "protocol_encoded",
    "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
]
TARGET = "label_encoded"

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "data", "models")
    
    # Load splits
    train_path = os.path.join(processed_dir, "train_data.csv")
    test_path = os.path.join(processed_dir, "test_data.csv")
    
    if not os.path.exists(train_path) or not os.path.exists(test_path):
        raise FileNotFoundError("Processed datasets not found. Run preprocessing first.")
        
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    X_train = train_df[FEATURES].values
    y_train = train_df[TARGET].values
    X_test = test_df[FEATURES].values
    y_test = test_df[TARGET].values
    
    # Load label encoder to list labels
    label_encoder = joblib.load(os.path.join(models_dir, "label_encoder.joblib"))
    classes = list(label_encoder.classes_)
    
    # Define models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "Support Vector Machine": SVC(probability=True, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "XGBoost": XGBClassifier(random_state=42, eval_metric="mlogloss", n_jobs=-1)
    }
    
    results = {}
    best_f1 = 0
    best_model_name = ""
    best_model = None
    xgb_model = None
    
    for name, clf in models.items():
        print(f"Training {name}...")
        
        # Train and measure time
        start_train = time.time()
        clf.fit(X_train, y_train)
        train_time = time.time() - start_train
        
        # Predict and measure time
        start_pred = time.time()
        y_pred = clf.predict(X_test)
        pred_time = (time.time() - start_pred) * 1000 / len(y_test) # millisecond per prediction
        
        y_probs = clf.predict_proba(X_test)
        
        # Evaluation Metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="weighted")
        rec = recall_score(y_test, y_pred, average="weighted")
        f1 = f1_score(y_test, y_pred, average="weighted")
        
        # Multi-class ROC AUC
        try:
            roc_auc = roc_auc_score(y_test, y_probs, multi_class="ovr", average="weighted")
        except Exception as e:
            roc_auc = 0.5
            print(f"ROC-AUC computation skipped for {name}: {str(e)}")
            
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        results[name] = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "training_time": float(train_time),
            "prediction_time_ms_per_flow": float(pred_time),
            "confusion_matrix": cm
        }
        
        print(f"{name} Completed: Accuracy={acc:.4f}, F1={f1:.4f}, Train Time={train_time:.2f}s")
        
        # Track best standard model (excluding XGBoost since XGBoost is saved separately)
        if name != "XGBoost" and f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = clf
            
        if name == "XGBoost":
            xgb_model = clf
            
    # Save the best standard model
    best_model_path = os.path.join(models_dir, "best_ml_model.joblib")
    joblib.dump(best_model, best_model_path)
    print(f"\nBest standard ML model ({best_model_name}) saved to: {best_model_path}")
    
    # Save XGBoost model separately
    xgb_path = os.path.join(models_dir, "xgboost_model.joblib")
    joblib.dump(xgb_model, xgb_path)
    print(f"XGBoost model saved to: {xgb_path}")
    
    # Save metrics JSON
    metrics_path = os.path.join(processed_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "classes": classes,
            "best_standard_model": best_model_name,
            "metrics": results
        }, f, indent=4)
    print(f"Model metrics JSON saved to: {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()
