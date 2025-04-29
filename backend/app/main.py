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

# Load the ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "BERTSQUADFP16.mlmodel")

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
    return {"status": "healthy", "model_loaded": model is not None}

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
    # This function needs to be adapted based on the actual output format of your model
    # For BERT-based question answering models, the output is typically start and end indices
    
    try:
        # Example implementation - adjust based on your model's output format
        if 'start_span' in prediction and 'end_span' in prediction:
            start_idx = int(prediction['start_span'][0])
            end_idx = int(prediction['end_span'][0])
            
            if start_idx <= end_idx and end_idx < len(context):
                return context[start_idx:end_idx+1]
        
        # If we can't extract a specific answer, return a default response
        return "I'm not sure I can provide a specific answer based on the available information."
    
    except Exception as e:
        logger.error(f"Error extracting answer: {str(e)}")
        return "I encountered an error while processing your question."

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

