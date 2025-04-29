import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, useTheme } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const Header = () => {
  const theme = useTheme();

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <SmartToyIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Backdoor AI
          </Typography>
        </Box>
        <Box>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ mx: 1 }}
          >
            Chat
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            color="inherit"
            sx={{ mx: 1 }}
          >
            About
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

