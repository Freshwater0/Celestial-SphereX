import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return /^[a-zA-Z\s'-]{2,50}$/.test(value.trim()) 
          ? '' 
          : 'Name must be 2-50 characters with letters, spaces, apostrophes, and hyphens';
      
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) 
          ? '' 
          : 'Please enter a valid email address';
      
      case 'password':
        const passwordErrors = [];
        if (value.length < 8) passwordErrors.push('At least 8 characters');
        if (!/[A-Z]/.test(value)) passwordErrors.push('One uppercase letter');
        if (!/\d/.test(value)) passwordErrors.push('One number');
        if (!/[!@#$%^&*]/.test(value)) passwordErrors.push('One special character');
        return passwordErrors.length ? passwordErrors.join(', ') : '';
      
      case 'confirmPassword':
        return value !== formData.password 
          ? 'Passwords do not match' 
          : '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    // Name validation
    if (!/^[a-zA-Z\s'-]{2,50}$/.test(formData.name.trim())) {
      setError('Name must be 2-50 characters long and can only contain letters, spaces, apostrophes, and hyphens');
      return false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character (!@#$%^&*)');
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time field validation
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Clear overall form error
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.requiresVerification) {
        // Show success message but don't navigate
        setSuccessMessage(result.message);
      } else if (result.success) {
        // Registration successful and no verification required
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!validationErrors.password}
            FormHelperTextProps={{
              component: 'div'
            }}
            helperText={
              <div>
                <div style={{ marginBottom: '8px', color: validationErrors.password ? '#d32f2f' : 'inherit' }}>
                  Password requirements:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2em', listStyle: 'disc' }}>
                  <li style={{ 
                    color: formData.password.length >= 8 ? 'green' : (validationErrors.password ? '#d32f2f' : 'inherit')
                  }}>
                    At least 8 characters
                  </li>
                  <li style={{ 
                    color: /[A-Z]/.test(formData.password) ? 'green' : (validationErrors.password ? '#d32f2f' : 'inherit')
                  }}>
                    At least 1 uppercase letter
                  </li>
                  <li style={{ 
                    color: /\d/.test(formData.password) ? 'green' : (validationErrors.password ? '#d32f2f' : 'inherit')
                  }}>
                    At least 1 number
                  </li>
                  <li style={{ 
                    color: /[!@#$%^&*]/.test(formData.password) ? 'green' : (validationErrors.password ? '#d32f2f' : 'inherit')
                  }}>
                    At least 1 special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            }
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
