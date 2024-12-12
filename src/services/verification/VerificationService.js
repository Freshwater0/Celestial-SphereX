const { User, EmailVerification } = require('../../models');
const EmailService = require('../email/EmailService');

class VerificationService {
  static async createVerification(userId, transaction = null) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate token and expiration
    const token = User.generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create verification record
    const verification = await EmailVerification.create({
      user_id: userId,
      token,
      expires_at: expiresAt
    }, { transaction });

    // Send verification email
    await EmailService.sendVerificationEmail(user, token);

    return verification;
  }

  static async verifyEmail(token, transaction = null) {
    const verification = await EmailVerification.findOne({
      where: {
        token,
        verified_at: null,
        expires_at: {
          [User.sequelize.Op.gt]: new Date()
        }
      },
      include: [{
        model: User,
        as: 'user',
        where: {
          is_verified: false
        }
      }],
      transaction
    });

    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    // Update verification record and user in a transaction
    await User.sequelize.transaction(async (t) => {
      const transactionToUse = transaction || t;

      // Update verification record
      verification.verified_at = new Date();
      await verification.save({ transaction: transactionToUse });

      // Update user
      const user = verification.user;
      user.is_verified = true;
      await user.save({ transaction: transactionToUse });
    });

    // Send welcome email
    await EmailService.sendWelcomeEmail(verification.user);

    return verification.user;
  }

  static async resendVerification(userId, transaction = null) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.is_verified) {
      throw new Error('Email already verified');
    }

    // Check for existing unverified token
    const existingVerification = await EmailVerification.findOne({
      where: {
        user_id: userId,
        verified_at: null,
        expires_at: {
          [User.sequelize.Op.gt]: new Date()
        }
      },
      transaction
    });

    if (existingVerification) {
      // Resend email with existing token
      await EmailService.sendVerificationEmail(user, existingVerification.token);
      return existingVerification;
    }

    // Create new verification if no valid one exists
    return await this.createVerification(userId, transaction);
  }

  static async getVerificationStatus(userId, transaction = null) {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found');
    }

    const latestVerification = await EmailVerification.findOne({
      where: {
        user_id: userId
      },
      order: [['created_at', 'DESC']],
      transaction
    });

    return {
      isVerified: user.is_verified,
      hasPendingVerification: latestVerification && !latestVerification.verified_at && new Date() < latestVerification.expires_at,
      lastVerificationSentAt: latestVerification ? latestVerification.created_at : null
    };
  }
}

module.exports = VerificationService;
