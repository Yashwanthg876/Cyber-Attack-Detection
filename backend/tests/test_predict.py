import sys
import os

# Append project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ensemble import predict_flow, load_models

def run_test():
    print("Testing Aegis ML/DL Ensemble Prediction Pipeline...")
    
    # 1. Warm up models
    load_models()
    
    # 2. Mock a DOS threat connection
    dos_flow = {
        "flow_duration": 8500000.0,
        "packet_count": 65,
        "packet_length_mean": 110.0,
        "src_port": 50123,
        "dest_port": 80,
        "protocol": "TCP",
        "flow_bytes_s": 1500.0,
        "flow_packets_s": 7.5,
        "active_mean": 1500000.0,
        "idle_mean": 7000000.0
    }
    
    # 3. Mock a Normal web session
    normal_flow = {
        "flow_duration": 450000.0,
        "packet_count": 10,
        "packet_length_mean": 450.0,
        "src_port": 54321,
        "dest_port": 443,
        "protocol": "TCP",
        "flow_bytes_s": 10000.0,
        "flow_packets_s": 22.2,
        "active_mean": 450000.0,
        "idle_mean": 0.0
    }
    
    # Run test evaluation 1
    res_dos = predict_flow(dos_flow)
    print("\n--- TEST CASE 1: Expected DoS Threat ---")
    print(f"Prediction: {res_dos['prediction']}")
    print(f"Confidence: {res_dos['confidence']:.4f}")
    print(f"Severity:   {res_dos['severity']}")
    print(f"Risk Score: {res_dos['risk_score']}")
    
    assert res_dos['prediction'] == "DoS", f"Expected DoS but got {res_dos['prediction']}"
    assert res_dos['risk_score'] > 60, f"Expected elevated risk score but got {res_dos['risk_score']}"
    
    # Run test evaluation 2
    res_normal = predict_flow(normal_flow)
    print("\n--- TEST CASE 2: Expected Benign Flow ---")
    print(f"Prediction: {res_normal['prediction']}")
    print(f"Confidence: {res_normal['confidence']:.4f}")
    print(f"Severity:   {res_normal['severity']}")
    print(f"Risk Score: {res_normal['risk_score']}")
    
    assert res_normal['prediction'] == "Benign", f"Expected Benign but got {res_normal['prediction']}"
    assert res_normal['risk_score'] < 20, f"Expected low risk score but got {res_normal['risk_score']}"
    
    print("\nAll pipeline assertions PASSED successfully!")

if __name__ == "__main__":
    run_test()
