import os
import requests
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dropbox direct download link for the .mlmodel file
# Note: This should be a direct download link from Dropbox (usually ends with ?dl=1)
DROPBOX_LINK = "https://www.dropbox.com/scl/fi/your-file-path/BERTSQUADFP16.mlmodel?dl=1"

# Function to validate the downloaded model
def validate_model(model_path):
    """
    Validate that the downloaded model is a valid CoreML model.
    
    Args:
        model_path (str): Path to the downloaded model file
        
    Returns:
        bool: True if the model is valid, False otherwise
    """
    try:
        import coremltools as ct
        # Try to load the model to validate it
        model = ct.models.MLModel(model_path)
        # Get basic model info to verify it loaded correctly
        spec = model.get_spec()
        logger.info(f"Model validated successfully: {spec.description.metadata.shortDescription}")
        return True
    except Exception as e:
        logger.error(f"Model validation failed: {str(e)}")
        return False

def download_model():
    """
    Download the ML model from Dropbox and save it to the appropriate location.
    
    Returns:
        bool: True if download was successful, False otherwise
    """
    # Define the model directory and file path
    model_dir = os.path.join(os.path.dirname(__file__), "app", "model")
    model_path = os.path.join(model_dir, "BERTSQUADFP16.mlmodel")
    
    # Create the model directory if it doesn't exist
    os.makedirs(model_dir, exist_ok=True)
    
    # Check if the model already exists
    if os.path.exists(model_path):
        logger.info(f"Model already exists at {model_path}")
        # Validate the existing model
        if validate_model(model_path):
            return True
        else:
            logger.warning("Existing model is invalid. Will attempt to re-download.")
    
    try:
        logger.info(f"Downloading model from Dropbox to {model_path}")
        
        # Send a GET request to the Dropbox link
        response = requests.get(DROPBOX_LINK, stream=True)
        
        # Check if the request was successful
        if response.status_code == 200:
            # Get the total file size
            total_size = int(response.headers.get('content-length', 0))
            
            # Write the file in chunks
            with open(model_path, 'wb') as f:
                downloaded = 0
                chunk_size = 1024 * 1024  # 1MB chunks
                
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:  # filter out keep-alive new chunks
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        # Calculate and print progress
                        progress = (downloaded / total_size) * 100 if total_size > 0 else 0
                        logger.info(f"Download progress: {progress:.2f}% ({downloaded}/{total_size} bytes)")
            
            logger.info(f"Model downloaded successfully to {model_path}")
            
            # Validate the downloaded model
            if validate_model(model_path):
                return True
            else:
                logger.error("Downloaded model failed validation")
                return False
        else:
            logger.error(f"Failed to download model. Status code: {response.status_code}")
            return False
    
    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        return False

if __name__ == "__main__":
    success = download_model()
    print(f"Model download {'successful' if success else 'failed'}")
