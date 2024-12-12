require('dotenv').config();
const { Resend } = require('resend');
const verificationEmailTemplate = require('./templates/verificationEmail');
const welcomeEmailTemplate = require('./templates/welcomeEmail');

class EmailService {
  static resend = new Resend(process.env.RESEND_API_KEY);

  static async sendVerificationEmail(user, verificationToken) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try {
      console.log('Sending verification email with:', {
        from: 'Celestial Sphere <celestialspherex@resend.dev>',
        to: user.email,
        subject: 'Verify Your Celestial Sphere Account',
        RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
        FRONTEND_URL: process.env.FRONTEND_URL,
        verificationLink
      });

      const response = await EmailService.resend.emails.send({
        from: 'Celestial Sphere <celestialspherex@resend.dev>',
        to: user.email,
        subject: 'Verify Your Celestial Sphere Account',
        html: verificationEmailTemplate(user.username, verificationLink)
      });

      console.log('Resend API Response:', response);
      console.log('Verification email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending verification email:', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        response: error.response
      });
      throw new Error('Failed to send verification email: ' + error.message);
    }
  }

  static async sendWelcomeEmail(user) {
    try {
      console.log('Sending welcome email to:', user.email);
      const response = await EmailService.resend.emails.send({
        from: 'Celestial Sphere <celestialspherex@resend.dev>',
        to: user.email,
        subject: 'Welcome to Celestial Sphere!',
        html: welcomeEmailTemplate(user.username)
      });

      console.log('Welcome email sent successfully to:', user.email);
      console.log('Resend API Response:', response);
    } catch (error) {
      console.error('Error sending welcome email:', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        response: error.response
      });
      throw new Error('Failed to send welcome email: ' + error.message);
    }
  }
}

module.exports = EmailService;
