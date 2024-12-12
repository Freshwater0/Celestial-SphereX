const express = require('express');
const router = express.Router();
const PayPalService = require('../../services/paypalService');
const SubscriptionService = require('../../services/subscriptionService');
const { validateEmail } = require('../../utils/validation');

// Create PayPal order for registration
router.post('/create-registration-order', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Received registration order request:', { email });

    // Validate email
    if (!validateEmail(email)) {
      console.error('Invalid email format:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Frontend URLs for return and cancel
    const returnUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/complete-registration`
      : 'http://localhost:3000/complete-registration';
    
    const cancelUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/registration`
      : 'http://localhost:3000/registration';

    console.log('PayPal Order URLs:', { returnUrl, cancelUrl });

    // Create PayPal order
    const order = await PayPalService.createSubscriptionOrder(
      email, 
      returnUrl, 
      cancelUrl
    );

    console.log('PayPal Order Created:', order);

    // Create pending subscription record
    const subscription = await SubscriptionService.createPendingSubscription({
      paypalOrderId: order.id,
      email: email
    });

    console.log('Pending Subscription Created:', subscription);

    // Return order details and subscription info
    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        approvalLink: order.links.find(link => link.rel === 'approve').href
      },
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.error('PayPal Registration Order Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create registration order',
      details: error.message
    });
  }
});

// Complete registration after PayPal payment
router.post('/complete-registration', async (req, res) => {
  try {
    const { 
      orderId, 
      subscriptionId, 
      userData 
    } = req.body;

    // Capture the PayPal order
    const capturedOrder = await PayPalService.captureOrder(orderId);

    // Complete registration using subscription service
    const user = await SubscriptionService.completeRegistration(
      subscriptionId, 
      userData, 
      capturedOrder
    );

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('PayPal Registration Completion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete registration' 
    });
  }
});

module.exports = router;
