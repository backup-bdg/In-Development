import os
import coremltools as ct
import json

def test_model():
    """Test the ML model to ensure it's working correctly"""
    model_path = os.path.join(os.path.dirname(__file__), "app", "model", "BERTSQUADFP16.mlmodel")
    
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        return False
    
    try:
        print(f"Loading model from {model_path}")
        model = ct.models.MLModel(model_path)
        print("Model loaded successfully")
        
        # Get model metadata
        spec = model.get_spec()
        print(f"Model type: {spec.description.metadata.shortDescription}")
        
        # Print input and output descriptions
        print("\nInputs:")
        for input_desc in spec.description.input:
            print(f"  - {input_desc.name}: {input_desc.type}")
        
        print("\nOutputs:")
        for output_desc in spec.description.output:
            print(f"  - {output_desc.name}: {output_desc.type}")
        
        # Test with a sample input
        sample_input = {
            'query_text': 'What is machine learning?',
            'passage_text': 'Machine learning is a field of artificial intelligence that uses statistical techniques to give computer systems the ability to "learn" from data, without being explicitly programmed.'
        }
        
        print("\nTesting with sample input:")
        print(json.dumps(sample_input, indent=2))
        
        prediction = model.predict(sample_input)
        print("\nModel prediction:")
        print(json.dumps(prediction, indent=2, default=str))
        
        return True
    
    except Exception as e:
        print(f"Error testing model: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_model()
    print(f"\nModel test {'successful' if success else 'failed'}")

