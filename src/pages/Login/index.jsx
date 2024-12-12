import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link as MuiLink, 
  CircularProgress, 
  Alert,
  Divider,
  useTheme,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { endpoints } from '../../config/endpoints';
import logo from '../../assets/images/logo.png';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Real-time field validation
    if (name === 'email') {
      const emailError = !validateEmail(value) 
        ? 'Please enter a valid email address' 
        : '';
      setValidationErrors(prev => ({ ...prev, email: emailError }));
    }

    if (name === 'password') {
      const passwordError = !validatePassword(value)
        ? 'Password must be 8+ chars, include uppercase, lowercase, number'
        : '';
      setValidationErrors(prev => ({ ...prev, password: passwordError }));
    }

    // Clear login error
    setLoginError('');
  };

  const validateForm = () => {
    const emailError = !validateEmail(formData.email) 
      ? 'Please enter a valid email address' 
      : '';
    const passwordError = !validatePassword(formData.password)
      ? 'Password must be 8+ chars, include uppercase, lowercase, number'
      : '';

    setValidationErrors({ email: emailError, password: passwordError });
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      
      if (!result.token) {
        throw new Error(result.message || 'Login failed. Please check your credentials.');
      }

      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 16 }} />
          <Typography component="h1" variant="h5" sx={{ color: 'text.primary' }}>
            Sign In
          </Typography>
        </Box>

        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& input': {
                color: '#000000',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& input': {
                color: '#000000',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666666',
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ 
            mt: 2, 
            mb: 2, 
            py: 1.5,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <MuiLink 
            component={Link} 
            to="/forgot-password" 
            variant="body2"
            sx={{ color: theme.palette.primary.main }}
          >
            Forgot Password?
          </MuiLink>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ 
            mt: 2, 
            py: 1.5,
            borderColor: '#DB4437',
            color: '#DB4437',
            '&:hover': {
              backgroundColor: 'rgba(219, 68, 55, 0.1)',
              borderColor: '#DB4437',
            },
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
