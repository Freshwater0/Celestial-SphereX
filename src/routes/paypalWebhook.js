const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const PayPalService = require('../services/paypalService');
const SubscriptionService = require('../services/subscriptionService');

// Middleware to parse JSON bodies
router.use(bodyParser.json());

// PayPal webhook endpoint
router.post('/webhook', async (req, res) => {
    const event = req.body;

    try {
        // Handle the event based on its type
        switch (event.event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                // Process successful subscription payment
                await SubscriptionService.processPayPalSubscription(event.resource);
                console.log('Subscription payment completed:', event);
                break;

            case 'PAYMENT.SALE.DENIED':
                // Handle denied payment
                await SubscriptionService.handleFailedPayment(event.resource.subscription_id);
                console.log('Payment denied:', event);
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                // Handle subscription cancellation
                await SubscriptionService.suspendAccount(event.resource.id);
                console.log('Subscription cancelled:', event);
                break;

            default:
                console.log('Unhandled event type:', event.event_type);
                break;
        }

        // Respond to PayPal to acknowledge receipt of the event
        res.status(200).send('Webhook received successfully');
    } catch (error) {
        console.error('PayPal Webhook Error:', error);
        res.status(500).send('Error processing webhook');
    }
});

module.exports = router;
