const { Op } = require('sequelize');
const { sequelize } = require('../models');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const EmailService = require('./emailService');
const moment = require('moment');
const crypto = require('crypto');
const logger = require('../utils/logger');

class SubscriptionService {
  async createPendingSubscription({ paypalOrderId, email }) {
    const transaction = await sequelize.transaction();

    try {
      logger.info('Creating pending subscription', { paypalOrderId, email });

      // Generate registration token
      const registrationToken = this.generateRegistrationToken();

      // Create pending subscription
      const subscription = await Subscription.create({
        paypalOrderId,
        status: 'pending',
        startDate: new Date(),
        endDate: moment().add(7, 'days').toDate(),
        trialPeriod: true,
        registrationToken,
        tokenExpiresAt: moment().add(24, 'hours').toDate(),
        email // Store email for reference
      }, { transaction });

      // Send registration link via email
      await EmailService.sendTrialActivationEmail(
        email, 
        registrationToken
      );

      await transaction.commit();
      logger.info('Pending subscription created successfully', { subscriptionId: subscription.id });

      return subscription;
    } catch (error) {
      await transaction.rollback();
      logger.error('Pending Subscription Creation Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  generateRegistrationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async completeRegistration(subscriptionId, userData, paypalOrderDetails) {
    const transaction = await sequelize.transaction();

    try {
      logger.info('Completing registration', { subscriptionId, userData });

      // Find the pending subscription
      const subscription = await Subscription.findByPk(subscriptionId, { transaction });
      
      if (!subscription) {
        throw new Error('Invalid subscription');
      }

      // Validate registration token and expiration
      if (subscription.tokenExpiresAt < new Date()) {
        throw new Error('Registration token expired');
      }

      // Create user
      const user = await User.create({
        ...userData,
        email: subscription.email, // Use email from subscription
        isVerified: true  // PayPal verification implies email verification
      }, { transaction });

      // Update subscription
      await subscription.update({
        userId: user.id,
        status: 'active',
        paypalSubscriptionId: paypalOrderDetails.id,
        registrationToken: null,
        tokenExpiresAt: null
      }, { transaction });

      // Commit transaction
      await transaction.commit();
      logger.info('Registration completed successfully', { userId: user.id });

      return user;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();
      logger.error('Registration Completion Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async processPayPalSubscription(paypalOrderDetails) {
    try {
      logger.info('Processing PayPal subscription', { orderId: paypalOrderDetails.id });

      // Find pending subscription by PayPal order ID
      const subscription = await Subscription.findOne({
        where: { paypalOrderId: paypalOrderDetails.id }
      });

      if (!subscription) {
        throw new Error('No pending subscription found for this PayPal order');
      }

      // Update subscription status
      await subscription.update({
        status: 'active',
        paypalSubscriptionId: paypalOrderDetails.id
      });

      logger.info('PayPal subscription processed successfully', { subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      logger.error('PayPal Subscription Processing Error:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async checkTrialExpirationAndNotify() {
    const now = new Date();
    
    // Find subscriptions expiring in 2 days
    const expiringSubscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        trialPeriod: true,
        endDate: {
          [Op.between]: [
            moment().add(2, 'days').toDate(), 
            moment().add(3, 'days').toDate()
          ]
        }
      },
      include: [{ model: User }]
    });

    for (const subscription of expiringSubscriptions) {
      await EmailService.sendTrialExpirationWarning(
        subscription.user.email, 
        moment(subscription.endDate).format('YYYY-MM-DD')
      );
    }
  }

  async handleFailedPayment(subscriptionId) {
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: User }]
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Send payment failure notification
    await EmailService.sendPaymentFailureNotification(
      subscription.user.email
    );

    // Mark subscription as past due
    await subscription.update({
      status: 'past_due'
    });
  }

  async suspendAccount(subscriptionId) {
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: User }]
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Send account suspension warning
    await EmailService.sendAccountSuspensionWarning(
      subscription.user.email
    );

    // Update user and subscription status
    await subscription.update({
      status: 'suspended'
    });

    await User.update(
      { accountStatus: 'suspended' },
      { where: { id: subscription.userId } }
    );
  }

  // Cron job to run daily checks
  async dailySubscriptionCheck() {
    await this.checkTrialExpirationAndNotify();
    
    // Check for past due accounts to potentially suspend
    const pastDueSubscriptions = await Subscription.findAll({
      where: {
        status: 'past_due',
        endDate: {
          [Op.lt]: moment().subtract(4, 'days').toDate()
        }
      }
    });

    for (const subscription of pastDueSubscriptions) {
      await this.suspendAccount(subscription.id);
    }
  }
}

module.exports = new SubscriptionService();
