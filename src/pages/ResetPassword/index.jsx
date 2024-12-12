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
  LinearProgress,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock as LockIcon, 
  CheckCircle, 
  ErrorOutline 
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [tokenValidity, setTokenValidity] = useState(null);

  useEffect(() => {
    // Validate reset token on component mount
    const validateResetToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setTokenValidity(response.ok);
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValidity(false);
      }
    };

    validateResetToken();
  }, [token]);

  const validatePassword = useCallback((password) => {
    if (!password) return 'Password is required';

    const passwordStrengthResult = zxcvbn(password);
    setPasswordStrength(passwordStrengthResult.score);

    if (password.length < 12) return 'Password must be at least 12 characters long';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[0-9])/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    
    return '';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Check token validity
    if (!tokenValidity) {
      setError('Invalid or expired reset token. Please request a new password reset.');
      setIsLoading(false);
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          clientTimestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const strengthColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#7ED7C1'];

    return passwordStrength !== null && password && (
      <Box sx={{ mt: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={(passwordStrength + 1) * 20} 
          color={passwordStrength < 2 ? 'error' : passwordStrength < 4 ? 'warning' : 'success'}
          sx={{ mb: 1 }}
        />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: strengthColors[passwordStrength]
        }}>
          {passwordStrength < 2 ? <ErrorOutline sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} />}
          <Typography variant="caption">
            Password Strength: {strengthLabels[passwordStrength]}
          </Typography>
        </Box>
      </Box>
    );
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
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Reset Your Password
          </Typography>

          {tokenValidity === false && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              Invalid or expired reset token. Please request a new password reset.
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              Password has been reset successfully. Redirecting to login...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ width: '100%' }}
          >
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || success || tokenValidity === false}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading || success || tokenValidity === false}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {renderPasswordStrengthIndicator()}

            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || success || tokenValidity === false}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showConfirmPassword ? "Hide Password" : "Show Password"}>
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isLoading || success || tokenValidity === false}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || success || tokenValidity === false}
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
              ) : (
                'Reset Password'
              )}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" color="primary">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
