import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SpeedIcon from '@mui/icons-material/Speed';

const AboutPage = () => {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SmartToyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          About Backdoor AI
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Backdoor AI is a powerful conversational AI assistant that leverages advanced machine learning
        to provide intelligent responses to your questions and requests. Built on a state-of-the-art
        BERT-based model, Backdoor AI can understand context, search the web for information,
        and engage in natural conversations.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Key Features
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <SmartToyIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Natural Language Understanding" 
            secondary="Understands context and nuance in your questions to provide relevant answers"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <SearchIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Web Search Integration" 
            secondary="Can search the web to find up-to-date information when needed"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CodeIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Code Understanding" 
            secondary="Can help with programming questions and explain code snippets"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CloudDownloadIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Chat Export" 
            secondary="Export your entire conversation history in JSON format for reference"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <SecurityIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Privacy Focused" 
            secondary="Your conversations are not stored permanently unless you choose to save them"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <SpeedIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Fast Response Time" 
            secondary="Optimized for quick responses even with complex queries"
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Technical Details
      </Typography>
      
      <Typography variant="body1" paragraph>
        Backdoor AI is powered by a BERT-based question answering model that has been optimized for
        performance using CoreML. The application is built with a modern tech stack:
      </Typography>
      
      <Typography variant="body1" component="div">
        <ul>
          <li><strong>Frontend:</strong> React, Material-UI, and modern JavaScript</li>
          <li><strong>Backend:</strong> FastAPI, Python, and CoreML for model inference</li>
          <li><strong>Model:</strong> BERT-based question answering model optimized for performance</li>
          <li><strong>Deployment:</strong> Containerized with Docker and deployed on Render.com</li>
        </ul>
      </Typography>
      
      <Box sx={{ mt: 4, bgcolor: 'primary.light', p: 3, borderRadius: 2, color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Get Started
        </Typography>
        <Typography variant="body1">
          Head back to the Chat page and start asking questions! Backdoor AI is ready to assist you
          with information, explanations, and more.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AboutPage;

