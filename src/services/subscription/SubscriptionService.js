const { Subscription } = require('../../models');

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

class SubscriptionService {
  static async startTrial(userId, transaction = null) {
    try {
      // Check if user already has a subscription
      const existingSubscription = await Subscription.findOne({
        where: { userId },
        transaction
      });

      if (existingSubscription) {
        throw new Error('User already has a subscription');
      }

      // Create new trial subscription
      const subscription = await Subscription.create({
        userId,
        status: 'trial',
        trialStartDate: new Date(),
        trialEndDate: addDays(new Date(), 7) // 7-day trial
      }, { transaction });

      return subscription;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }

  static async checkTrialStatus(userId) {
    try {
      const subscription = await Subscription.findOne({
        where: { userId }
      });

      if (!subscription) {
        return { hasSubscription: false };
      }

      const now = new Date();
      const trialEnded = now > new Date(subscription.trialEndDate);

      if (subscription.status === 'trial' && trialEnded) {
        // Trial has ended, update status
        subscription.status = 'expired';
        await subscription.save();

        return {
          hasSubscription: true,
          status: 'expired',
          message: 'Trial period has ended'
        };
      }

      return {
        hasSubscription: true,
        status: subscription.status,
        trialEndsAt: subscription.trialEndDate,
        subscriptionEndsAt: subscription.subscriptionEndDate
      };
    } catch (error) {
      console.error('Error checking trial status:', error);
      throw error;
    }
  }

  static async activateSubscription(userId, stripeSubscriptionId, stripeCustomerId, transaction = null) {
    try {
      const subscription = await Subscription.findOne({
        where: { userId },
        transaction
      });

      if (!subscription) {
        throw new Error('No subscription found for user');
      }

      // Update subscription details
      subscription.status = 'active';
      subscription.stripeSubscriptionId = stripeSubscriptionId;
      subscription.stripeCustomerId = stripeCustomerId;
      subscription.subscriptionStartDate = new Date();
      
      // Set subscription end date to one month from now
      subscription.subscriptionEndDate = addDays(new Date(), 30);
      
      await subscription.save({ transaction });

      return subscription;
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  }

  static async cancelSubscription(userId, transaction = null) {
    try {
      const subscription = await Subscription.findOne({
        where: { userId },
        transaction
      });

      if (!subscription) {
        throw new Error('No subscription found for user');
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save({ transaction });

      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;
