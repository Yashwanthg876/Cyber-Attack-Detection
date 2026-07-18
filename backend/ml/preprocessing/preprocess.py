import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Removes duplicates, handles NaNs and mathematical infinities."""
    print(f"Initial shape: {df.shape}")
    
    # 1. Remove duplicates
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"Shape after removing duplicates: {df.shape}")
    
    # 2. Replace infinite values with NaN, then impute NaNs with 0/median
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(0, inplace=True)
    
    return df

def handle_outliers(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    """Clips extreme outliers to the 99.5th percentile to keep variance stable while retaining attack footprints."""
    for col in columns:
        if col in df.columns and col not in ["src_port", "dest_port", "protocol", "label"]:
            q_limit = df[col].quantile(0.995)
            df[col] = np.clip(df[col], 0, q_limit)
    print("Outlier handling complete (capped at 99.5th percentile).")
    return df

def analyze_correlations(df: pd.DataFrame, numeric_cols: list):
    """Logs highly correlated features to console."""
    corr_matrix = df[numeric_cols].corr().abs()
    upper_tri = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    
    # Identify pairs with correlation > 0.95
    high_corr = [column for column in upper_tri.columns if any(upper_tri[column] > 0.95)]
    if high_corr:
        print(f"Highly correlated features detected: {high_corr}")
    else:
        print("No extreme collinearity detected (> 0.95 correlation).")

def run_preprocessing():
    # File Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    raw_path = os.path.join(base_dir, "data", "raw", "network_traffic.csv")
    processed_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "data", "models")
    
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw data file not found at {raw_path}. Run dataset generation first.")
        
    df = pd.read_csv(raw_path)
    
    # 1. Clean Data
    df = clean_data(df)
    
    # Numeric columns for scaling and correlation analysis
    numeric_cols = [
        "flow_duration", "packet_count", "packet_length_mean",
        "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
    ]
    
    # 2. Outlier handling
    df = handle_outliers(df, numeric_cols)
    
    # 3. Correlation Analysis
    analyze_correlations(df, numeric_cols)
    
    # 4. Encode Categorical Columns
    # Map protocols to integer IDs: TCP=6, UDP=17, ICMP=1 (matching standard IP protocol numbers)
    protocol_map = {"TCP": 6, "UDP": 17, "ICMP": 1}
    df["protocol_encoded"] = df["protocol"].map(protocol_map).fillna(0).astype(int)
    
    # Encode target labels
    label_encoder = LabelEncoder()
    df["label_encoded"] = label_encoder.fit_transform(df["label"])
    
    # Save the label encoder
    label_encoder_path = os.path.join(models_dir, "label_encoder.joblib")
    joblib.dump(label_encoder, label_encoder_path)
    print(f"Label encoder saved to: {label_encoder_path}")
    print(f"Classes encoded: {list(label_encoder.classes_)}")
    
    # Define features to scale and train on
    features = [
        "flow_duration", "packet_count", "packet_length_mean",
        "src_port", "dest_port", "protocol_encoded",
        "flow_bytes_s", "flow_packets_s", "active_mean", "idle_mean"
    ]
    
    # 5. Scaling numeric columns and port values
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features].values)
    
    # Save the scaler
    scaler_path = os.path.join(models_dir, "scaler.joblib")
    joblib.dump(scaler, scaler_path)
    print(f"StandardScaler saved to: {scaler_path}")
    
    # 6. Train-Test Split (80/20)
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df["label_encoded"])
    
    # Save processed files
    train_df.to_csv(os.path.join(processed_dir, "train_data.csv"), index=False)
    test_df.to_csv(os.path.join(processed_dir, "test_data.csv"), index=False)
    
    print(f"Preprocessing complete. Train size: {train_df.shape}, Test size: {test_df.shape}")

if __name__ == "__main__":
    run_preprocessing()
