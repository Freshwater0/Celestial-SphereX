import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token received');
        }

        // Store token
        localStorage.setItem('token', token);
        localStorage.setItem('isAuthenticated', 'true');

        // Fetch user data
        const response = await fetch('http://localhost:5555/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Google callback error:', error);
        navigate('/login', { 
          state: { 
            error: 'Failed to complete Google sign-in. Please try again.' 
          }
        });
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 4 }} />
      <Typography variant="h6" color="white">
        Completing sign in...
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
