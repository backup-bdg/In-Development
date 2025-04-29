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
  
  const messagesEndRef = useRef(null);

  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      try {
        // For now, just generate a client-side session ID
        // In a production app, you'd get this from the backend
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        
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
    
    try {
      // Call API to get AI response
      const response = await chatService.sendMessage(sessionId, userMessage, useWebSearch);
      
      // Add AI response to chat
      setMessages((prevMessages) => [...prevMessages, response]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get a response. Please try again.');
      
      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          intent: 'error',
          timestamp: new Date().toISOString(),
        },
      ]);
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
    a.download = `backdoor-ai-chat-${new Date().toLocaleDateString().replace(/\\//g, '-')}.json`;
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

