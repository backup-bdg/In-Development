import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';

const ChatInput = ({ onSendMessage, onToggleSettings, disabled = false, webSearchEnabled = false }) => {
  const [message, setMessage] = useState('');
  const [isWebSearch, setIsWebSearch] = useState(webSearchEnabled);

  // Update isWebSearch when webSearchEnabled prop changes
  React.useEffect(() => {
    setIsWebSearch(webSearchEnabled);
  }, [webSearchEnabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
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
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <TextField
        fullWidth
        variant="standard"
        placeholder={disabled ? "Connection to AI unavailable..." : "Type your message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        InputProps={{
          disableUnderline: true,
        }}
        sx={{ ml: 1, flex: 1 }}
        disabled={disabled}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={isWebSearch ? "Web search enabled" : "Enable web search"}>
          <span> {/* Wrap in span to make tooltip work when button is disabled */}
            <IconButton
              color={isWebSearch ? "primary" : "default"}
              onClick={() => setIsWebSearch(!isWebSearch)}
              edge="end"
              disabled={disabled}
            >
              <SearchIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={onToggleSettings} edge="end">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={disabled ? "Connection unavailable" : "Send message"}>
          <span> {/* Wrap in span to make tooltip work when button is disabled */}
            <IconButton 
              color="primary" 
              type="submit" 
              edge="end"
              disabled={!message.trim() || disabled}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ChatInput;
