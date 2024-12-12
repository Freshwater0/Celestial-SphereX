import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { exchangeCodeForToken } from '../../services/twitch';
import { secureStore } from '../../config/socialMedia';

const TwitchCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange the code for tokens
        const tokenData = await exchangeCodeForToken(code);

        // Store the tokens securely
        secureStore('TWITCH', {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
          scope: tokenData.scope,
        });

        // Redirect back to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Twitch auth error:', err);
        setError(err.message);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography color="text.secondary">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} sx={{ color: '#9146FF' }} />
      <Typography variant="h6">
        Connecting to Twitch...
      </Typography>
    </Box>
  );
};

export default TwitchCallback;
