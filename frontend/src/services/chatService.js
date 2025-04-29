import axios from 'axios';

// Define API base URL - will use the proxy in development or the placeholder in production
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'REACT_APP_API_URL_PLACEHOLDER' 
  : '';

// Create axios instance with timeout and retry logic
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Create a more detailed error object
    const enhancedError = {
      message: 'An error occurred while communicating with the server',
      originalError: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    };
    
    return Promise.reject(enhancedError);
  }
);

// Mock response for development when backend is not available
const mockResponse = (message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        "I'm here to help! What would you like to know?",
        "That's an interesting question. Let me think about that...",
        "Based on my knowledge, I can provide some insights on this topic.",
        "I found some information that might be helpful for you.",
        "I'm not entirely sure about that, but here's what I know.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      resolve({
        role: 'assistant',
        content: `${randomResponse} (Responding to: "${message.content}")`,
        intent: 'general_response',
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  });
};

// Chat service methods
export const chatService = {
  // Create a new chat session
  createSession: async () => {
    try {
      const response = await api.post('/api/chat/session');
      return {
        sessionId: response.data.session_id,
        messages: response.data.messages || []
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      // Return a mock session ID for development
      return { sessionId: 'mock-session-' + Date.now(), messages: [] };
    }
  },
  
  // Send a message and get a response
  sendMessage: async (sessionId, message, useWebSearch = false) => {
    try {
      console.log('Sending message to API:', { sessionId, message, useWebSearch });
      
      // In a real app, we'd send the message to the backend
      const response = await api.post(`/api/chat/${sessionId}`, {
        ...message,
        web_search: useWebSearch,
      });
      
      // Log the response for debugging
      console.log('API response:', response.data);
      
      return {
        role: response.data.role || 'assistant',
        content: response.data.content || 'Sorry, I could not generate a response.',
        intent: response.data.intent || 'general_response',
        timestamp: response.data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      
      // For development, return a mock response if the API is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock response in development mode');
        return mockResponse(message);
      }
      
      // Create a user-friendly error message
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      if (error.status === 503) {
        errorMessage = 'The AI model is not currently loaded. Please try again later.';
      } else if (error.data && error.data.detail) {
        errorMessage = `Error: ${error.data.detail}`;
      }
      
      // Return an error message as the assistant's response
      return {
        role: 'assistant',
        content: errorMessage,
        intent: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  },
  
  // Export chat session
  exportChat: async (sessionId) => {
    try {
      const response = await api.get(`/api/chat/${sessionId}/export`);
      return response.data;
    } catch (error) {
      console.error('Error exporting chat:', error);
      throw error;
    }
  },
  
  // Check if the backend is available
  checkHealth: async () => {
    try {
      const response = await api.get('/');
      console.log('Health check response:', response.data);
      return response.data.status === 'healthy' && response.data.model_loaded === true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
};
