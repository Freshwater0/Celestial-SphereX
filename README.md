# Celestial Sphere Backend

## PayPal Integration

### Configuration

1. Obtain PayPal Developer Credentials
   - Create a PayPal Developer account at [PayPal Developer Portal](https://developer.paypal.com/)
   - Generate Client ID and Secret for both Sandbox and Production environments

2. Environment Variables
   Set the following in your `.env` file:
   ```
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_client_secret
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development  # or production
   ```

### Registration Flow

1. Frontend initiates PayPal order creation
   - Endpoint: `POST /api/paypal/create-registration-order`
   - Requires user email
   - Returns PayPal order details and approval link

2. User completes PayPal payment
   - Redirected to frontend registration completion page

3. Backend completes registration
   - Endpoint: `POST /api/paypal/complete-registration`
   - Captures PayPal order
   - Creates user and subscription records

### Key Components

- `PayPalService`: Handles PayPal SDK interactions
- `SubscriptionService`: Manages registration and subscription logic
- `Subscription Model`: Tracks subscription details

### Security Considerations

- Transaction-based registration
- 24-hour registration token expiration
- Environment-aware configuration
- Secure token generation

### Troubleshooting

- Ensure all environment variables are correctly set
- Check PayPal Developer Dashboard for webhook and API configurations
- Verify frontend callback URLs match configuration

### Testing

- Use PayPal Sandbox for development
- Test various scenarios:
  * Successful registration
  * Payment cancellation
  * Token expiration
