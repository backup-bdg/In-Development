import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Slider,
  Box,
  Divider,
} from '@mui/material';

const SettingsDialog = ({ open, onClose, settings, onSettingsChange }) => {
  const handleSwitchChange = (event) => {
    onSettingsChange({
      ...settings,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSliderChange = (name) => (event, newValue) => {
    onSettingsChange({
      ...settings,
      [name]: newValue,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          AI Behavior
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.webSearchEnabled}
              onChange={handleSwitchChange}
              name="webSearchEnabled"
              color="primary"
            />
          }
          label="Enable web search by default"
        />
        <Box sx={{ mt: 2 }}>
          <Typography id="creativity-slider" gutterBottom>
            Creativity
          </Typography>
          <Slider
            value={settings.creativity}
            onChange={handleSliderChange('creativity')}
            aria-labelledby="creativity-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={10}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Interface
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.darkMode}
              onChange={handleSwitchChange}
              name="darkMode"
              color="primary"
            />
          }
          label="Dark mode"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.showTimestamps}
              onChange={handleSwitchChange}
              name="showTimestamps"
              color="primary"
            />
          }
          label="Show message timestamps"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;

