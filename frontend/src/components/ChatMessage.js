import React from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ErrorIcon from '@mui/icons-material/Error';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const ChatMessage = ({ message }) => {
  const { role, content, intent, timestamp } = message;
  const isUser = role === 'user';
  const isError = intent === 'error';
  const isTyping = intent === 'typing';
  
  // Format timestamp if available
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: isError ? 'error.main' : 'primary.main',
            mr: 1,
            width: 36,
            height: 36,
          }}
        >
          {isError ? <ErrorIcon /> : <SmartToyIcon />}
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isUser 
              ? 'primary.light' 
              : isError 
                ? 'error.light' 
                : 'background.default',
            color: isUser ? 'primary.contrastText' : 'text.primary',
          }}
        >
          {isTyping ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MoreHorizIcon sx={{ mr: 1 }} />
              <Typography variant="body1">Thinking...</Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {content}
            </Typography>
          )}
          
          {timestamp && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 1, 
                textAlign: isUser ? 'right' : 'left',
                color: isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              }}
            >
              {formattedTime}
            </Typography>
          )}
        </Paper>
        
        {intent && intent !== 'typing' && intent !== 'error' && (
          <Chip
            label={intent.replace('_', ' ')}
            size="small"
            sx={{ 
              mt: 0.5, 
              ml: isUser ? 'auto' : 0,
              mr: isUser ? 0 : 'auto',
              display: 'block',
              width: 'fit-content',
            }}
          />
        )}
      </Box>
      
      {isUser && (
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            ml: 1,
            width: 36,
            height: 36,
          }}
        >
          <PersonIcon />
        </Avatar>
      )}
    </Box>
  );
};

export default ChatMessage;
