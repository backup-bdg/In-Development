#!/usr/bin/env python3
"""
Setup script for downloading and configuring the CoreML model.
This script helps users set up the model correctly.
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def update_dropbox_link(dropbox_link):
    """Update the Dropbox link in the download_model.py file"""
    try:
        download_model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "download_model.py")
        
        if not os.path.exists(download_model_path):
            logger.error(f"download_model.py not found at {download_model_path}")
            return False
        
        # Read the file
        with open(download_model_path, 'r') as f:
            content = f.read()
        
        # Replace the Dropbox link
        if "DROPBOX_LINK = " in content:
            # Find the line with the Dropbox link
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if "DROPBOX_LINK = " in line:
                    # Replace the line
                    lines[i] = f'DROPBOX_LINK = "{dropbox_link}"'
                    break
            
            # Write the updated content
            with open(download_model_path, 'w') as f:
                f.write('\n'.join(lines))
            
            logger.info(f"Updated Dropbox link in {download_model_path}")
            return True
        else:
            logger.error(f"Could not find DROPBOX_LINK in {download_model_path}")
            return False
    
    except Exception as e:
        logger.error(f"Error updating Dropbox link: {str(e)}")
        return False

def download_model():
    """Download the model using the download_model.py script"""
    try:
        # Import the download_model module
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from download_model import download_model as dm
        
        # Download the model
        logger.info("Downloading model...")
        success = dm()
        
        if success:
            logger.info("Model downloaded successfully")
        else:
            logger.error("Failed to download model")
        
        return success
    
    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        return False

def verify_model():
    """Verify the model using the verify_model.py script"""
    try:
        # Run the verify_model.py script
        verify_script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "verify_model.py")
        
        if not os.path.exists(verify_script_path):
            logger.error(f"verify_model.py not found at {verify_script_path}")
            return False
        
        logger.info("Verifying model...")
        os.system(f"python {verify_script_path}")
        
        # Check if the verification results file exists
        results_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_verification_results.json")
        if os.path.exists(results_path):
            with open(results_path, 'r') as f:
                results = json.load(f)
            
            all_success = all(step["success"] for step in results.values())
            if all_success:
                logger.info("Model verification successful")
                return True
            else:
                logger.error("Model verification failed")
                return False
        else:
            logger.error("Model verification results not found")
            return False
    
    except Exception as e:
        logger.error(f"Error verifying model: {str(e)}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Setup script for downloading and configuring the CoreML model")
    parser.add_argument("--dropbox-link", help="Dropbox direct download link for the model")
    parser.add_argument("--download-only", action="store_true", help="Only download the model without verification")
    parser.add_argument("--verify-only", action="store_true", help="Only verify the model without downloading")
    
    args = parser.parse_args()
    
    print("\n===== CoreML Model Setup Tool =====\n")
    
    # Update Dropbox link if provided
    if args.dropbox_link:
        print(f"\n----- Updating Dropbox link -----")
        if update_dropbox_link(args.dropbox_link):
            print("✅ Dropbox link updated successfully")
        else:
            print("❌ Failed to update Dropbox link")
            return
    
    # Download model if requested
    if not args.verify_only:
        print(f"\n----- Downloading model -----")
        if download_model():
            print("✅ Model downloaded successfully")
        else:
            print("❌ Failed to download model")
            print("\nPlease check the Dropbox link and try again.")
            return
    
    # Verify model if requested
    if not args.download_only:
        print(f"\n----- Verifying model -----")
        if verify_model():
            print("✅ Model verification successful")
        else:
            print("❌ Model verification failed")
            print("\nPlease check the model file and try again.")
            return
    
    print("\n===== Setup Complete =====")
    print("The model has been successfully set up and verified.")
    print("You can now run the backend server with: python run.py")

if __name__ == "__main__":
    main()

