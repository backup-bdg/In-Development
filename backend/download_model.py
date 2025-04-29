import os
import requests
import sys

def download_model():
    """Download the ML model from Dropbox"""
    model_url = "https://www.dropbox.com/scl/fi/w4iclrvil6vh39mg6j7pl/BERTSQUADFP16.mlmodel?rlkey=vbrr9jjvsam1xg9i4i19pkdra&st=k1dhc2p4&dl=1"
    model_dir = os.path.join(os.path.dirname(__file__), "app", "model")
    model_path = os.path.join(model_dir, "BERTSQUADFP16.mlmodel")
    
    # Create model directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)
    
    # Check if model already exists
    if os.path.exists(model_path):
        print(f"Model already exists at {model_path}")
        return True
    
    print(f"Downloading model from {model_url}")
    try:
        # Download with progress reporting
        response = requests.get(model_url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024  # 1 Kibibyte
        
        with open(model_path, 'wb') as f:
            downloaded = 0
            for data in response.iter_content(block_size):
                downloaded += len(data)
                f.write(data)
                
                # Update progress bar
                done = int(50 * downloaded / total_size)
                sys.stdout.write("\r[%s%s] %d%%" % ('=' * done, ' ' * (50-done), int(100 * downloaded / total_size)))
                sys.stdout.flush()
        
        print("\nDownload complete!")
        return True
    
    except Exception as e:
        print(f"Error downloading model: {str(e)}")
        return False

if __name__ == "__main__":
    success = download_model()
    print(f"Model download {'successful' if success else 'failed'}")

