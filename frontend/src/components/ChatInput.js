import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';

const ChatInput = ({ onSendMessage, onToggleSettings }) => {
  const [message, setMessage] = useState('');
  const [isWebSearch, setIsWebSearch] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, isWebSearch);
      setMessage('');
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: 'background.paper',
        position: 'sticky',
        bottom: 0,
      }}
    >
      <TextField
        fullWidth
        variant="standard"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        InputProps={{
          disableUnderline: true,
        }}
        sx={{ ml: 1, flex: 1 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={isWebSearch ? "Web search enabled" : "Enable web search"}>
          <IconButton
            color={isWebSearch ? "primary" : "default"}
            onClick={() => setIsWebSearch(!isWebSearch)}
            edge="end"
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={onToggleSettings} edge="end">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Send message">
          <IconButton 
            color="primary" 
            type="submit" 
            edge="end"
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ChatInput;

