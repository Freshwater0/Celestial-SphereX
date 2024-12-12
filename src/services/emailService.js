const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 465, // SSL port
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USERNAME || 'admin@celestialspherex.com',
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  }

  // Send verification email with registration link
  async sendVerificationEmail(user) {
    const registrationLink = `https://celestialsphere.com/register/complete?token=${user.registrationToken}`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: user.email,
        subject: 'Complete Your Celestial Sphere Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Celestial Sphere!</h2>
            <p>Hi ${user.name},</p>
            <p>You're almost ready to get started. Complete your registration by clicking the button below:</p>
            <a href="${registrationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Registration</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <small>  ${new Date().getFullYear()} Celestial Sphere. All rights reserved.</small>
          </div>
        `,
        text: `Welcome to Celestial Sphere! 

Complete your registration by clicking the link below:
${registrationLink}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

  ${new Date().getFullYear()} Celestial Sphere. All rights reserved.`
      });

      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Send subscription activation email
  async sendSubscriptionActivationEmail(user) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: user.email,
        subject: 'Your Celestial Sphere Subscription is Active',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Subscription Activated!</h2>
            <p>Hi ${user.name},</p>
            <p>Your Celestial Sphere subscription is now active. You can now fully access all features.</p>
            <p>Next billing date: ${user.nextBillingDate.toLocaleDateString()}</p>
            <a href="https://celestialsphere.com/account" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Subscription</a>
            <small>  ${new Date().getFullYear()} Celestial Sphere. All rights reserved.</small>
          </div>
        `,
        text: `Subscription Activated!

Hi ${user.name},

Your Celestial Sphere subscription is now active. You can now fully access all features.

Next billing date: ${user.nextBillingDate.toLocaleDateString()}

Manage your subscription: https://celestialsphere.com/account

  ${new Date().getFullYear()} Celestial Sphere. All rights reserved.`
      });

      console.log('Subscription activation email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending subscription activation email:', error);
      throw error;
    }
  }

  // Validate email configuration
  async validateEmailConfig() {
    try {
      await this.transporter.verify();
      console.log('Email server connection successful');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(userId, email, token) {
    try {
      const verificationUrl = `https://celestialsphere.com/verify-email?token=${token}`;
      
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Verify Your Email - Celestial Sphere',
        html: `
          <h1>Welcome to Celestial Sphere!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, token) {
    try {
      const resetUrl = `https://celestialsphere.com/reset-password?token=${token}`;
      
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Reset Your Password - Celestial Sphere',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendNotification(email, subject, message) {
    try {
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: subject,
        html: message
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending notification email:', error);
      return false;
    }
  }

  async sendTrialActivationEmail(email, registrationToken) {
    try {
      const registrationUrl = `https://celestialsphere.com/register?token=${registrationToken}`;
      
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Complete Your Celestial Sphere Registration',
        html: `
          <h1>Your Trial Activation Link</h1>
          <p>Click the link below to complete your registration and start your 7-day free trial:</p>
          <a href="${registrationUrl}">Complete Registration</a>
          <p>This link will expire in 24 hours.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Trial Activation Email Error:', error);
      return false;
    }
  }

  async sendTrialExpirationWarning(email, expirationDate) {
    try {
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Your Celestial Sphere Trial is Ending Soon',
        html: `
          <h1>Trial Ending Soon</h1>
          <p>Your 7-day free trial will expire on ${expirationDate}.</p>
          <p>To continue using Celestial Sphere, please complete your subscription.</p>
          <a href="https://celestialsphere.com/subscribe">Renew Subscription</a>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Trial Expiration Warning Email Error:', error);
      return false;
    }
  }

  async sendPaymentFailureNotification(email) {
    try {
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Payment Failed - Celestial Sphere',
        html: `
          <h1>Payment Processing Issue</h1>
          <p>We were unable to process your subscription payment.</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <a href="https://celestialsphere.com/billing">Update Payment Method</a>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Payment Failure Notification Email Error:', error);
      return false;
    }
  }

  async sendAccountSuspensionWarning(email) {
    try {
      const mailOptions = {
        from: '"Celestial Sphere" <admin@celestialspherex.com>',
        to: email,
        subject: 'Account Suspension Warning - Celestial Sphere',
        html: `
          <h1>Account Suspension Imminent</h1>
          <p>Your account will be suspended in 4 days due to outstanding payment.</p>
          <p>Please complete your payment to maintain uninterrupted access.</p>
          <a href="https://celestialsphere.com/billing">Pay Now</a>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Account Suspension Warning Email Error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
