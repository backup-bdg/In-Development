import os
import json
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import coremltools as ct
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import aiohttp
import asyncio
from bs4 import BeautifulSoup
import requests
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Backdoor AI - ML Model API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Determine model path from environment variable or default location
model_data_path = os.environ.get('MODEL_DATA_PATH', None)
if model_data_path:
    MODEL_PATH = os.path.join(model_data_path, "BERTSQUADFP16.mlmodel")
else:
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "BERTSQUADFP16.mlmodel")

# Check if model exists, if not try to download it
if not os.path.exists(MODEL_PATH):
    logger.warning(f"Model not found at {MODEL_PATH}. Attempting to download...")
    # Add the parent directory to sys.path to import download_model
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
    
    try:
        from download_model import download_model
        if not download_model():
            logger.error("Failed to download model")
            model = None
        else:
            # Try loading the model after download
            try:
                logger.info(f"Loading model from {MODEL_PATH}")
                model = ct.models.MLModel(MODEL_PATH)
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading model after download: {str(e)}")
                model = None
    except ImportError:
        logger.error("Could not import download_model module")
        model = None
else:
    # Load the ML model
    try:
        logger.info(f"Loading model from {MODEL_PATH}")
        model = ct.models.MLModel(MODEL_PATH)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = None

# Define request and response models
class QueryRequest(BaseModel):
    query: str
    context: Optional[str] = None
    web_search: bool = False
    search_query: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    intent: Optional[str] = None
    timestamp: Optional[str] = None

class ChatSession(BaseModel):
    messages: List[ChatMessage]
    session_id: str

@app.get("/")
async def root():
    """Health check endpoint"""
    model_status = {
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH)
    }
    return {"status": "healthy", **model_status}

@app.post("/api/query", response_model=Dict[str, Any])
async def process_query(request: QueryRequest):
    """Process a query using the ML model"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # If web search is enabled and no context is provided, fetch context from the web
        context = request.context
        if request.web_search and (not context or context.strip() == ""):
            search_query = request.search_query or request.query
            context = await search_web(search_query)
        
        if not context:
            context = "No context provided. I'll try to answer based on my knowledge."
        
        # Prepare input for the model
        model_input = {
            'query_text': request.query,
            'passage_text': context
        }
        
        # Get prediction from the model
        prediction = model.predict(model_input)
        
        # Extract the answer from the prediction
        answer = extract_answer(prediction, context)
        
        # Determine intent from the query
        intent = determine_intent(request.query)
        
        return {
            "answer": answer,
            "intent": intent,
            "context_used": context[:500] + "..." if len(context) > 500 else context
        }
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/chat/session", response_model=ChatSession)
async def create_chat_session():
    """Create a new chat session"""
    session_id = generate_session_id()
    return {"messages": [], "session_id": session_id}

@app.post("/api/chat/{session_id}", response_model=ChatMessage)
async def chat(session_id: str, message: ChatMessage):
    """Add a message to a chat session and get a response"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Process the user message
        if message.role != "user":
            raise HTTPException(status_code=400, detail="Only user messages can be sent")
        
        # Determine intent
        intent = determine_intent(message.content)
        
        # Get context from web if needed
        context = await search_web(message.content) if "search" in intent.lower() else ""
        
        # Prepare input for the model
        model_input = {
            'query_text': message.content,
            'passage_text': context or "Please provide a helpful response based on your knowledge."
        }
        
        # Get prediction from the model
        prediction = model.predict(model_input)
        
        # Extract the answer from the prediction
        answer = extract_answer(prediction, context)
        
        # Create assistant response
        response = ChatMessage(
            role="assistant",
            content=answer,
            intent=intent,
            timestamp=get_current_timestamp()
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.get("/api/chat/{session_id}/export", response_model=Dict[str, Any])
async def export_chat_session(session_id: str):
    """Export a chat session as JSON"""
    # In a real implementation, you would retrieve the session from a database
    # For this example, we'll return a sample session
    sample_session = {
        "session_id": session_id,
        "messages": [
            {
                "role": "user",
                "content": "Hello, how can you help me?",
                "intent": "greeting",
                "timestamp": "2023-11-01T12:00:00Z"
            },
            {
                "role": "assistant",
                "content": "Hi there! I'm Backdoor AI, and I'm here to help answer your questions and provide information. Feel free to ask me anything!",
                "intent": "greeting_response",
                "timestamp": "2023-11-01T12:00:05Z"
            }
        ]
    }
    
    return sample_session

# Helper functions
async def search_web(query: str) -> str:
    """Search the web for information related to the query"""
    try:
        async with aiohttp.ClientSession() as session:
            # Use a search engine API or scrape search results
            # For this example, we'll use a simple approach with DuckDuckGo
            search_url = f"https://duckduckgo.com/html/?q={query}"
            async with session.get(search_url, headers={"User-Agent": "Mozilla/5.0"}) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract search results
                    results = []
                    for result in soup.select(".result__body"):
                        title_elem = result.select_one(".result__title")
                        snippet_elem = result.select_one(".result__snippet")
                        
                        if title_elem and snippet_elem:
                            title = title_elem.get_text(strip=True)
                            snippet = snippet_elem.get_text(strip=True)
                            results.append(f"{title}: {snippet}")
                    
                    return "\n\n".join(results) if results else "No relevant information found."
                else:
                    return "Unable to search the web at this time."
    except Exception as e:
        logger.error(f"Error searching web: {str(e)}")
        return "Error occurred while searching the web."

def extract_answer(prediction: Dict[str, Any], context: str) -> str:
    """Extract the answer from the model prediction"""
    try:
        logger.info(f"Raw prediction: {prediction}")
        
        # Check if the prediction contains start and end indices
        if isinstance(prediction, dict) and 'start_span' in prediction and 'end_span' in prediction:
            # Handle array or single value
            start_idx = prediction['start_span'][0] if isinstance(prediction['start_span'], list) else prediction['start_span']
            end_idx = prediction['end_span'][0] if isinstance(prediction['end_span'], list) else prediction['end_span']
            
            # Convert to integers if they're numpy values or floats
            start_idx = int(start_idx)
            end_idx = int(end_idx)
            
            logger.info(f"Extracted indices: start={start_idx}, end={end_idx}")
            
            # Validate indices
            if start_idx >= 0 and end_idx >= start_idx and end_idx < len(context):
                answer = context[start_idx:end_idx+1].strip()
                logger.info(f"Extracted answer: {answer}")
                return answer
            else:
                logger.warning(f"Invalid indices: start={start_idx}, end={end_idx}, context_length={len(context)}")
        
        # If we can't extract a specific answer from the prediction format
        # Try to find any relevant information in the prediction
        if isinstance(prediction, dict):
            # Look for any field that might contain the answer
            for key in ['answer', 'text', 'response', 'output']:
                if key in prediction and isinstance(prediction[key], str):
                    return prediction[key]
        
        # If all else fails, generate a response based on the context
        return "Based on the information provided, I don't have a specific answer. Please try rephrasing your question."
    
    except Exception as e:
        logger.error(f"Error extracting answer: {str(e)}")
        return "I encountered an error while processing your question. Please try again."

def determine_intent(query: str) -> str:
    """Determine the intent of the user's query"""
    query = query.lower()
    
    if any(word in query for word in ["hello", "hi", "hey", "greetings"]):
        return "greeting"
    elif any(word in query for word in ["search", "find", "look up", "google"]):
        return "web_search"
    elif any(word in query for word in ["what is", "who is", "explain", "define"]):
        return "definition"
    elif any(word in query for word in ["how to", "how do i"]):
        return "instruction"
    elif any(word in query for word in ["why", "reason"]):
        return "explanation"
    else:
        return "general_query"

def generate_session_id() -> str:
    """Generate a unique session ID"""
    import uuid
    return str(uuid.uuid4())

def get_current_timestamp() -> str:
    """Get the current timestamp in ISO format"""
    from datetime import datetime
    return datetime.utcnow().isoformat() + "Z"
