import axios from 'axios';

// Define API base URL - will use the proxy in development or the placeholder in production
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'REACT_APP_API_URL_PLACEHOLDER' 
  : '';

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (increased from 30s)
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || {});
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
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
      
      // For production, throw a more user-friendly error
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to communicate with the AI. Please try again.';
      
      throw new Error(errorMessage);
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
      
      // Check if model is loaded
      if (!response.data.model_loaded) {
        console.warn('Model is not loaded on the backend');
        return false;
      }
      
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
  
  // Retry mechanism for failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        console.warn(`Request failed (attempt ${attempt}/${maxRetries}):`, error.message);
        lastError = error;
        
        // Wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  }
};
