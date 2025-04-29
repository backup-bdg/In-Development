import React from 'react';
import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageContainer = styled(Box)(({ theme, isUser }) => ({
  display: 'flex',
  flexDirection: isUser ? 'row-reverse' : 'row',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
}));

const MessageContent = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  maxWidth: '70%',
  borderRadius: '12px',
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  marginLeft: isUser ? 0 : theme.spacing(1),
  marginRight: isUser ? theme.spacing(1) : 0,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

const StyledAvatar = styled(Avatar)(({ theme, isUser }) => ({
  backgroundColor: isUser ? theme.palette.secondary.main : theme.palette.primary.main,
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& p': {
    margin: 0,
    marginBottom: theme.spacing(1),
  },
  '& p:last-child': {
    marginBottom: 0,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& ul, & ol': {
    marginTop: 0,
    paddingLeft: theme.spacing(2),
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
}));

const ChatMessage = ({ message }) => {
  const { role, content, intent, timestamp } = message;
  const isUser = role === 'user';
  
  // Format timestamp if available
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <MessageContainer isUser={isUser}>
      <StyledAvatar isUser={isUser}>
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </StyledAvatar>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <MessageContent isUser={isUser}>
          <MarkdownContent>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </MarkdownContent>
        </MessageContent>
        <Box sx={{ display: 'flex', mt: 0.5, mx: 1 }}>
          {intent && (
            <Chip 
              label={intent} 
              size="small" 
              sx={{ 
                mr: 1, 
                fontSize: '0.7rem',
                height: 20,
                backgroundColor: isUser ? 'rgba(98, 0, 234, 0.1)' : 'rgba(3, 218, 198, 0.1)',
              }} 
            />
          )}
          {timestamp && (
            <Typography variant="caption" color="text.secondary">
              {formattedTime}
            </Typography>
          )}
        </Box>
      </Box>
    </MessageContainer>
  );
};

export default ChatMessage;

