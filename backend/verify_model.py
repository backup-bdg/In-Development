#!/usr/bin/env python3
"""
Verify the CoreML model functionality and provide detailed diagnostics.
This script helps troubleshoot issues with the .mlmodel file.
"""

import os
import sys
import json
import logging
import traceback
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def verify_model_file():
    """Check if the model file exists and is accessible"""
    # Define possible model paths
    model_data_path = os.environ.get('MODEL_DATA_PATH', None)
    if model_data_path:
        model_path = os.path.join(model_data_path, "BERTSQUADFP16.mlmodel")
    else:
        app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
        model_path = os.path.join(app_dir, "model", "BERTSQUADFP16.mlmodel")
    
    # Check if model exists
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}")
        return False, f"Model file not found at {model_path}"
    
    # Check file size
    file_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
    logger.info(f"Model file exists at {model_path} (Size: {file_size:.2f} MB)")
    
    # Check file permissions
    try:
        with open(model_path, 'rb') as f:
            # Just read a small chunk to verify access
            f.read(1024)
        logger.info("Model file is readable")
        return True, model_path
    except Exception as e:
        logger.error(f"Error accessing model file: {str(e)}")
        return False, f"Error accessing model file: {str(e)}"

def verify_coremltools_installation():
    """Verify that coremltools is installed correctly"""
    try:
        import coremltools
        logger.info(f"coremltools version: {coremltools.__version__}")
        return True, f"coremltools version: {coremltools.__version__}"
    except ImportError:
        logger.error("coremltools is not installed")
        return False, "coremltools is not installed. Install with: pip install coremltools"
    except Exception as e:
        logger.error(f"Error importing coremltools: {str(e)}")
        return False, f"Error importing coremltools: {str(e)}"

def verify_model_loading(model_path):
    """Attempt to load the model and verify its structure"""
    try:
        import coremltools as ct
        logger.info(f"Loading model from {model_path}")
        model = ct.models.MLModel(model_path)
        
        # Get model metadata
        spec = model.get_spec()
        model_type = spec.description.metadata.shortDescription
        logger.info(f"Model type: {model_type}")
        
        # Get input and output descriptions
        inputs = []
        for input_desc in spec.description.input:
            inputs.append({
                "name": input_desc.name,
                "type": str(input_desc.type)
            })
        
        outputs = []
        for output_desc in spec.description.output:
            outputs.append({
                "name": output_desc.name,
                "type": str(output_desc.type)
            })
        
        logger.info(f"Model inputs: {json.dumps(inputs, indent=2)}")
        logger.info(f"Model outputs: {json.dumps(outputs, indent=2)}")
        
        return True, {
            "model_type": model_type,
            "inputs": inputs,
            "outputs": outputs
        }
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        logger.error(traceback.format_exc())
        return False, f"Error loading model: {str(e)}"

def test_model_prediction(model_path):
    """Test the model with a sample input"""
    try:
        import coremltools as ct
        import numpy as np
        
        model = ct.models.MLModel(model_path)
        
        # Create a sample input
        sample_input = {
            'query_text': 'What is machine learning?',
            'passage_text': 'Machine learning is a field of artificial intelligence that uses statistical techniques to give computer systems the ability to "learn" from data, without being explicitly programmed.'
        }
        
        logger.info(f"Testing model with sample input: {json.dumps(sample_input, indent=2)}")
        
        # Get prediction
        prediction = model.predict(sample_input)
        
        # Convert numpy arrays to lists for JSON serialization
        prediction_json = {}
        for key, value in prediction.items():
            if hasattr(value, 'tolist'):
                prediction_json[key] = value.tolist()
            else:
                prediction_json[key] = value
        
        logger.info(f"Model prediction: {json.dumps(prediction_json, indent=2)}")
        
        # Extract answer from prediction
        if 'start_span' in prediction and 'end_span' in prediction:
            start_idx = int(prediction['start_span'][0] if isinstance(prediction['start_span'], list) else prediction['start_span'])
            end_idx = int(prediction['end_span'][0] if isinstance(prediction['end_span'], list) else prediction['end_span'])
            
            if 0 <= start_idx <= end_idx < len(sample_input['passage_text']):
                answer = sample_input['passage_text'][start_idx:end_idx+1]
                logger.info(f"Extracted answer: '{answer}'")
                return True, {
                    "prediction": prediction_json,
                    "extracted_answer": answer
                }
            else:
                logger.warning(f"Invalid indices: start={start_idx}, end={end_idx}")
                return False, {
                    "prediction": prediction_json,
                    "error": f"Invalid indices: start={start_idx}, end={end_idx}"
                }
        else:
            logger.warning("Prediction does not contain start_span and end_span")
            return False, {
                "prediction": prediction_json,
                "error": "Prediction does not contain expected output format"
            }
    
    except Exception as e:
        logger.error(f"Error testing model: {str(e)}")
        logger.error(traceback.format_exc())
        return False, f"Error testing model: {str(e)}"

def main():
    """Run all verification steps"""
    print("\n===== CoreML Model Verification Tool =====\n")
    
    results = {}
    
    # Step 1: Verify model file
    print("\n----- Step 1: Verifying model file -----")
    success, result = verify_model_file()
    results["model_file"] = {"success": success, "result": result}
    if not success:
        print(f"❌ Model file verification failed: {result}")
        print("\nPlease ensure the model file exists and is accessible.")
        return
    
    print(f"✅ Model file verification successful: {result}")
    model_path = result
    
    # Step 2: Verify coremltools installation
    print("\n----- Step 2: Verifying coremltools installation -----")
    success, result = verify_coremltools_installation()
    results["coremltools"] = {"success": success, "result": result}
    if not success:
        print(f"❌ coremltools verification failed: {result}")
        print("\nPlease install coremltools with: pip install coremltools")
        return
    
    print(f"✅ coremltools verification successful: {result}")
    
    # Step 3: Verify model loading
    print("\n----- Step 3: Verifying model loading -----")
    success, result = verify_model_loading(model_path)
    results["model_loading"] = {"success": success, "result": result}
    if not success:
        print(f"❌ Model loading failed: {result}")
        print("\nThe model file may be corrupted or incompatible.")
        return
    
    print(f"✅ Model loading successful")
    print(f"   Model type: {result['model_type']}")
    print(f"   Inputs: {json.dumps(result['inputs'], indent=2)}")
    print(f"   Outputs: {json.dumps(result['outputs'], indent=2)}")
    
    # Step 4: Test model prediction
    print("\n----- Step 4: Testing model prediction -----")
    success, result = test_model_prediction(model_path)
    results["model_prediction"] = {"success": success, "result": result}
    if not success:
        print(f"❌ Model prediction test failed")
        if isinstance(result, dict) and "error" in result:
            print(f"   Error: {result['error']}")
        else:
            print(f"   Error: {result}")
        print("\nThe model may not be functioning correctly.")
    else:
        print(f"✅ Model prediction test successful")
        print(f"   Extracted answer: '{result['extracted_answer']}'")
    
    # Summary
    print("\n===== Verification Summary =====")
    all_success = all(step["success"] for step in results.values())
    if all_success:
        print("✅ All verification steps passed! The model should be working correctly.")
    else:
        print("❌ Some verification steps failed. Please check the details above.")
    
    # Save results to file
    with open("model_verification_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nDetailed results saved to model_verification_results.json")

if __name__ == "__main__":
    main()

