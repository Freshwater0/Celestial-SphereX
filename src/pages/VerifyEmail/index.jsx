import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setSuccess(true);
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 3000);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verify();
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, [token, verifyEmail, navigate]);

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
            Email Verification
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body1" color="textSecondary">
                Verifying your email...
              </Typography>
            </Box>
          ) : success ? (
            <Alert 
              severity="success" 
              sx={{ width: '100%', mb: 2 }}
            >
              Your email has been verified successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <>
              <Alert 
                severity="error" 
                sx={{ width: '100%', mb: 3 }}
              >
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
