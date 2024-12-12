import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper 
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

const BrandingEditor = ({ onBrandingUpdate }) => {
  const [branding, setBranding] = useState({
    companyName: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBranding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBranding(prev => ({
        ...prev,
        logo: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = () => {
    onBrandingUpdate(branding);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        <FormatPaintIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Report Branding
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            value={branding.companyName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center">
            <ColorLensIcon sx={{ mr: 2 }} />
            <TextField
              type="color"
              label="Primary Color"
              name="primaryColor"
              value={branding.primaryColor}
              onChange={handleChange}
            />
            <TextField
              type="color"
              label="Secondary Color"
              name="secondaryColor"
              value={branding.secondaryColor}
              onChange={handleChange}
              sx={{ ml: 2 }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="logo-upload"
            type="file"
            onChange={handleLogoUpload}
          />
          <label htmlFor="logo-upload">
            <Button 
              variant="contained" 
              component="span" 
              startIcon={<ColorLensIcon />}
            >
              Upload Logo
            </Button>
          </label>
          {branding.logo && (
            <Box mt={2}>
              <img 
                src={branding.logo} 
                alt="Logo Preview" 
                style={{ maxHeight: 100, maxWidth: 200 }} 
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
          >
            Update Branding
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BrandingEditor;
