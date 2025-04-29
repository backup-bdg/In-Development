import os
import subprocess
import sys
from download_model import download_model

def run_backend():
    """Run the backend server locally"""
    # First, download the model if it doesn't exist
    if not download_model():
        print("Failed to download the model. Exiting.")
        return False
    
    # Run the backend server
    try:
        print("Starting backend server...")
        subprocess.run(["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
        return True
    
    except Exception as e:
        print(f"Error starting backend server: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_backend()
    sys.exit(0 if success else 1)

