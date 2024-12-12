import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';

const PaymentDetails = ({ onSubmit, onBack, isLoading }) => {
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    // Initialize Square
    const initializeSquare = async () => {
      if (!window.Square) {
        throw new Error('Square.js failed to load');
      }

      try {
        const payments = window.Square.payments(process.env.REACT_APP_SQUARE_APP_ID, process.env.REACT_APP_SQUARE_LOCATION_ID);
        const card = await payments.card();
        await card.attach('#card-container');
        
        setCard(card);
        setPayments(payments);
      } catch (e) {
        console.error('Square initialization error:', e);
        setError('Failed to load payment form. Please try again.');
      }
    };

    // Load Square.js
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = initializeSquare;
    script.onerror = () => {
      setError('Failed to load payment system. Please try again.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!card) {
      setError('Payment form not initialized');
      return;
    }

    try {
      const result = await card.tokenize();
      if (result.status === 'OK') {
        // Send the token to your server
        onSubmit({
          paymentToken: result.token,
          paymentMethod: 'square'
        });
      } else {
        setError('Failed to process payment method. Please try again.');
      }
    } catch (e) {
      console.error('Payment error:', e);
      setError(e.message || 'Failed to process payment method');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CreditCardIcon color="primary" />
        <Typography variant="h6" component="h2">
          Payment Details
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your card details to complete signup
        </Typography>

        {/* Square's Card Form will be mounted here */}
        <div id="card-container" />
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isLoading}
          sx={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !card}
          sx={{ flex: 1 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Complete Signup'}
        </Button>
      </Box>

      <Typography 
        variant="caption" 
        color="text.secondary"
        align="center"
        sx={{ 
          display: 'block',
          mt: 2,
          textAlign: 'center'
        }}
      >
        Payments are securely processed by Square
      </Typography>
    </Box>
  );
};

export default PaymentDetails;
