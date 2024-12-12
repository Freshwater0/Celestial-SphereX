const paypal = require('@paypal/checkout-server-sdk');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class PayPalService {
  constructor() {
    try {
      // Log environment variables
      logger.info('PayPal Service Initialization', {
        NODE_ENV: process.env.NODE_ENV,
        PAYPAL_SANDBOX_CLIENT_ID: process.env.PAYPAL_SANDBOX_CLIENT_ID ? 'SET' : 'UNSET',
        PAYPAL_SANDBOX_CLIENT_SECRET: process.env.PAYPAL_SANDBOX_CLIENT_SECRET ? 'SET' : 'UNSET'
      });

      // Configure PayPal environment
      if (process.env.NODE_ENV === 'production') {
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
          logger.error('PayPal Live credentials are missing');
          throw new Error('PayPal Live credentials are missing');
        }
        this.environment = new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        );
      } else {
        // For development/sandbox environment
        const clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          logger.warn('PayPal Sandbox credentials are missing - using mock service');
          this.mockMode = true;
          return;
        }

        logger.info('Initializing PayPal Sandbox environment');
        this.environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
      }

      // Create PayPal client
      this.client = new paypal.core.PayPalHttpClient(this.environment);
      logger.info('PayPal client initialized successfully');
    } catch (error) {
      logger.error('PayPal Service Initialization Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      if (process.env.NODE_ENV === 'production') {
        throw error;
      } else {
        logger.warn('Running in mock mode due to initialization error');
        this.mockMode = true;
      }
    }
  }

  async createSubscriptionOrder(email, returnUrl, cancelUrl) {
    try {
      logger.info('Creating PayPal Order', { email, returnUrl, cancelUrl });

      if (this.mockMode) {
        logger.warn('Using mock PayPal service - returning test order');
        return {
          id: `MOCK-${uuidv4()}`,
          status: 'CREATED',
          links: [
            {
              href: 'https://www.sandbox.paypal.com/mock-approval-url',
              rel: 'approve',
              method: 'GET'
            }
          ]
        };
      }

      // Create a new order request
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '9.99', // Registration fee
          },
          description: 'User Registration',
          custom_id: uuidv4() // Unique identifier for this order
        }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING'
        }
      });

      // Send the request to PayPal
      const response = await this.client.execute(request);
      
      logger.info('PayPal Order Response:', {
        id: response.result.id,
        status: response.result.status,
        links: response.result.links
      });

      return response.result;
    } catch (error) {
      logger.error('PayPal Order Creation Error:', {
        message: error.message,
        name: error.name,
        response: error.response ? JSON.stringify(error.response) : 'No response',
        stack: error.stack
      });
      throw error;
    }
  }

  async captureOrder(orderId) {
    try {
      logger.info('Capturing PayPal Order', { orderId });

      if (this.mockMode) {
        logger.warn('Using mock PayPal service - returning test capture');
        return {
          id: orderId,
          status: 'COMPLETED',
          payer: {
            email_address: 'test@example.com',
            payer_id: `MOCK-PAYER-${uuidv4()}`
          }
        };
      }

      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const response = await this.client.execute(request);
      
      logger.info('PayPal Order Capture Response:', {
        id: response.result.id,
        status: response.result.status,
        payer: response.result.payer
      });

      return response.result;
    } catch (error) {
      logger.error('PayPal Order Capture Error:', {
        message: error.message,
        name: error.name,
        response: error.response ? JSON.stringify(error.response) : 'No response',
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new PayPalService();
