import React from 'react';
import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const ChatMessage = ({ message, showTimestamp = true }) => {
  const { role, content, intent, timestamp } = message;
  const isUser = role === 'user';
  
  // Format timestamp if available
  const formattedTime = timestamp && showTimestamp ? new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : null;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        mb: 2,
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
          mr: isUser ? 0 : 1,
          ml: isUser ? 1 : 0,
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      
      <Box sx={{ maxWidth: '75%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isUser ? 'primary.light' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            position: 'relative',
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
          
          {intent && !isUser && (
            <Chip
              label={intent.replace(/_/g, ' ')}
              size="small"
              sx={{
                position: 'absolute',
                top: -10,
                right: 10,
                fontSize: '0.7rem',
                height: 20,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
              }}
            />
          )}
        </Paper>
        
        {formattedTime && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: 'text.secondary',
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {formattedTime}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;
