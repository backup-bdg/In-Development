import axios from 'axios';

// Define API base URL - will use the proxy in development
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://backdoor-ai-backend.onrender.com' 
  : '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // For development, return a mock response if the API is not available
      if (process.env.NODE_ENV === 'development') {
        return mockResponse(message);
      }
      
      throw error;
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
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  },
};

