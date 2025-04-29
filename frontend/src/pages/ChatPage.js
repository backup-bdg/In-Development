import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SettingsDialog from '../components/SettingsDialog';
import { v4 as uuidv4 } from 'uuid';
import { chatService } from '../services/chatService';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    webSearchEnabled: true,
    creativity: 7,
    darkMode: false,
    showTimestamps: true,
  });
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        
        // Check if backend is available
        const healthCheck = await chatService.checkHealth();
        setBackendAvailable(healthCheck);
        
        if (!healthCheck) {
          setError('Backend service is not available. Using fallback mode.');
          console.warn('Backend service is not available. Using fallback mode.');
          setModelLoaded(false);
        } else {
          // Extract model loaded status from health check
          setModelLoaded(healthCheck);
          
          if (!healthCheck) {
            setError('AI model is not loaded. Some features may be limited.');
            console.warn('AI model is not loaded. Some features may be limited.');
          }
        }
        
        // Create a new chat session
        const session = await chatService.createSession();
        setSessionId(session.sessionId);
        
        // Add welcome message
        setMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m Backdoor AI. How can I help you today?',
            intent: 'greeting',
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error('Failed to initialize chat session:', err);
        setError('Failed to start chat session. Please try again.');
        setBackendAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content, useWebSearch = settings.webSearchEnabled) => {
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      // Show typing indicator
      const typingIndicatorId = Date.now();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: typingIndicatorId,
          role: 'assistant',
          content: '...',
          intent: 'typing',
          timestamp: new Date().toISOString(),
        },
      ]);
      
      // Call API to get AI response
      const response = await chatService.sendMessage(sessionId, userMessage, useWebSearch);
      
      // Remove typing indicator and add AI response to chat
      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter(msg => msg.id !== typingIndicatorId);
        return [...filteredMessages, response];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Create a user-friendly error message
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (err.status === 503) {
        errorMessage = 'The AI model is not currently loaded. Please try again later.';
      } else if (err.data && err.data.detail) {
        errorMessage = `Error: ${err.data.detail}`;
      }
      
      setError('Failed to get a response. Please try again.');
      
      // Remove typing indicator if it exists
      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter(msg => msg.intent !== 'typing');
        
        // Add error message
        return [
          ...filteredMessages,
          {
            role: 'assistant',
            content: errorMessage,
            intent: 'error',
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportChat = () => {
    // Create a JSON file with the chat history
    const chatData = {
      sessionId,
      messages,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backdoor-ai-chat-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportChat}
          disabled={messages.length <= 1}
        >
          Export Chat
        </Button>
      </Box>
      
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          p: 3,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, px: 1 }}>
          {messages.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Welcome to Backdoor AI
              </Typography>
              <Typography variant="body1">
                Start a conversation by typing a message below.
              </Typography>
            </Box>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          onToggleSettings={() => setSettingsOpen(true)}
        />
      </Paper>
      
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatPage;
