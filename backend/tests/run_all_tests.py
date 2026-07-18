import os
import sys
import subprocess
import time

def run_script(script_name: str) -> bool:
    print(f"\n========================================================")
    print(f"RUNNING TEST SUITE: {script_name}")
    print(f"========================================================")
    
    start_time = time.time()
    # Execute python script in a subprocess
    process = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    duration = time.time() - start_time
    
    # Print outputs
    if process.stdout:
        print(process.stdout.strip())
    if process.stderr:
        print(f"ERROR OUTPUT:\n{process.stderr.strip()}", file=sys.stderr)
        
    status = process.returncode == 0
    print(f"--------------------------------------------------------")
    print(f"STATUS: {'PASSED' if status else 'FAILED'} (Duration: {duration:.2f}s)")
    print(f"========================================================\n")
    return status

def run_all():
    tests_dir = os.path.dirname(os.path.abspath(__file__))
    
    test_suites = [
        "test_auth.py",
        "test_predict.py",
        "test_explain.py"
    ]
    
    results = {}
    
    print("Initializing Aegis SOC Verification Pipeline Suite...")
    print(f"Found {len(test_suites)} test modules inside {tests_dir}.\n")
    
    for test in test_suites:
        test_path = os.path.join(tests_dir, test)
        if not os.path.exists(test_path):
            print(f"WARNING: Test script {test} not found at {test_path}!")
            results[test] = False
            continue
            
        success = run_script(test_path)
        results[test] = success
        
    print("\n========================================================")
    print("FINAL AEGIS SOC TEST PIPELINE REPORT SUMMARY")
    print("========================================================")
    
    all_passed = True
    for test, passed in results.items():
        print(f"  * {test:<18} : {'[ PASSED ]' if passed else '[ FAILED ]'}")
        if not passed:
            all_passed = False
            
    print("========================================================")
    if all_passed:
        print("RESULT: ALL SECURITY PIPELINES VERIFIED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("RESULT: TESTING PIPELINE FAILED. CHECK LOGS ABOVE.")
        sys.exit(1)

if __name__ == "__main__":
    run_all()
