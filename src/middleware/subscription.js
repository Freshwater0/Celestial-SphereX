const SubscriptionService = require('../services/subscription/SubscriptionService');

const checkSubscription = async (req, res, next) => {
  try {
    // Skip subscription check for all auth routes
    if (req.baseUrl === '/api/auth') {
      return next();
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscriptionStatus = await SubscriptionService.checkTrialStatus(userId);

    if (!subscriptionStatus.hasSubscription) {
      return res.status(403).json({
        error: 'Subscription required',
        message: 'Please start your free trial or subscribe to access this feature'
      });
    }

    if (subscriptionStatus.status === 'expired') {
      return res.status(403).json({
        error: 'Subscription expired',
        message: 'Your trial period has ended. Please subscribe to continue using our services'
      });
    }

    // Add subscription info to request for use in other middleware/routes
    req.subscription = subscriptionStatus;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to verify subscription status' });
  }
};

module.exports = { checkSubscription };
