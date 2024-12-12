import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Info, 
  CheckCircle, 
  ErrorOutline 
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import zxcvbn from 'zxcvbn';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const validateName = useCallback((name) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    if (name.length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[A-Za-z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return null;
  }, []);

  const validateEmail = useCallback((email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) return 'Password is required';
    
    const passwordStrengthResult = zxcvbn(password);
    setPasswordStrength(passwordStrengthResult.score);

    if (password.length < 12) return 'Password must be at least 12 characters long';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[0-9])/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    
    return null;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const firstNameError = validateName(formData.firstName);
    const lastNameError = validateName(formData.lastName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        setRegistrationSuccess(true);
        // Short delay before navigation to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrors({
          submit: {
            type: 'error',
            message: result.error || 'Registration failed. Please try again.'
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: {
          type: 'error',
          message: error.message || 'An unexpected error occurred. Please try again later.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const strengthColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#7ED7C1'];

    return passwordStrength !== null && formData.password && (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mt: 1,
        color: strengthColors[passwordStrength]
      }}>
        {passwordStrength < 2 ? <ErrorOutline sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} />}
        <Typography variant="caption">
          Password Strength: {strengthLabels[passwordStrength]}
        </Typography>
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
              mb: 3,
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Create Account
          </Typography>

          {!registrationSuccess && (
            <Alert 
              severity="info" 
              icon={<Info />}
              sx={{ width: '100%', mb: 3 }}
            >
              Create a secure account with a strong password
            </Alert>
          )}

          {errors.submit && (
            <Alert 
              severity={errors.submit.type} 
              sx={{ width: '100%', mb: 3 }}
            >
              {errors.submit.message}
            </Alert>
          )}

          {registrationSuccess && (
            <Alert 
              severity="success" 
              sx={{ width: '100%', mb: 3 }}
            >
              Registration successful! Redirecting...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={isLoading || registrationSuccess}
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={isLoading || registrationSuccess}
                required
                variant="outlined"
              />
            </Box>

            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading || registrationSuccess}
              required
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading || registrationSuccess}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading || registrationSuccess}
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
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isLoading || registrationSuccess}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showConfirmPassword ? "Hide Password" : "Show Password"}>
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isLoading || registrationSuccess}
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
              disabled={isLoading || registrationSuccess}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 2,
                fontSize: '1.1rem',
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
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

export default Signup;
