import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Email as EmailIcon, 
  ArrowBack as ArrowBackIcon, 
  ErrorOutline as ErrorOutlineIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/endpoints';
import zxcvbn from 'zxcvbn';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [cooldownTime, setCooldownTime] = useState(0);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }, []);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Check cooldown
    if (cooldownTime > 0) {
      setError(`Please wait ${cooldownTime} seconds before trying again`);
      return;
    }

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Attempt tracking
    if (remainingAttempts <= 0) {
      setCooldownTime(60); // 1-minute cooldown
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(endpoints.auth.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          clientTimestamp: new Date().toISOString() 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setRemainingAttempts(3);
      } else {
        // Decrement attempts
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        
        throw new Error(data.error || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      // Always show success-like message to prevent email enumeration
      setSuccess(true);
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttemptWarning = () => {
    if (remainingAttempts <= 1) {
      return (
        <Alert 
          severity="warning" 
          icon={<ErrorOutlineIcon />}
          sx={{ width: '100%', mb: 2 }}
        >
          {`Warning: You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining`}
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Tooltip title="Back to Login">
              <IconButton 
                onClick={() => navigate('/login')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Reset Password
            </Typography>
          </Box>

          {renderAttemptWarning()}

          {success && (
            <Alert 
              severity="success" 
              sx={{ width: '100%', mb: 3 }}
            >
              If an account exists with this email, you will receive password reset instructions.
            </Alert>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 3 }}
            >
              {error}
            </Alert>
          )}

          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              color: 'text.secondary' 
            }}
          >
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ width: '100%' }}
          >
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || success}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || success || cooldownTime > 0}
              sx={{
                py: 1.5,
                mb: 3,
                borderRadius: 2,
                fontSize: '1.1rem',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : cooldownTime > 0 ? (
                `Wait ${cooldownTime}s`
              ) : (
                'Send Reset Instructions'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
