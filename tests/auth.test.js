const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');
const { EmailService } = require('../services/emailService');

describe('Authentication Tests', () => {
  // Clean up users before and after tests
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  // Successful Registration Test
  describe('Registration', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'StrongPass123!',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.email).toBe('test@example.com');
    });

    // Validation Failure Tests
    const invalidRegistrationCases = [
      { 
        name: 'missing email', 
        payload: { 
          password: 'StrongPass123!', 
          name: 'Test User', 
          firstName: 'Test', 
          lastName: 'User' 
        },
        expectedStatus: 400
      },
      { 
        name: 'missing password', 
        payload: { 
          email: 'test@example.com', 
          name: 'Test User', 
          firstName: 'Test', 
          lastName: 'User' 
        },
        expectedStatus: 400
      },
      { 
        name: 'invalid email format', 
        payload: { 
          email: 'invalid-email', 
          password: 'StrongPass123!', 
          name: 'Test User', 
          firstName: 'Test', 
          lastName: 'User' 
        },
        expectedStatus: 400
      },
      { 
        name: 'weak password', 
        payload: { 
          email: 'test@example.com', 
          password: 'weak', 
          name: 'Test User', 
          firstName: 'Test', 
          lastName: 'User' 
        },
        expectedStatus: 400
      }
    ];

    invalidRegistrationCases.forEach(testCase => {
      it(`should fail registration with ${testCase.name}`, async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testCase.payload);

        expect(response.statusCode).toBe(testCase.expectedStatus);
        expect(response.body.success).toBe(false);
      });
    });

    // Duplicate User Test
    it('should prevent duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'StrongPass123!',
          name: 'First User',
          firstName: 'First',
          lastName: 'User'
        });

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'AnotherStrongPass123!',
          name: 'Second User',
          firstName: 'Second',
          lastName: 'User'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Login Tests
  describe('Login', () => {
    // Setup a user for login tests
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('ValidPassword123!', 10);
      await User.create({
        email: 'login@example.com',
        password: hashedPassword,
        name: 'Login User',
        username: 'loginuser',
        firstName: 'Login',
        lastName: 'User'
      });
    });

    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'ValidPassword123!'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeTruthy();
    });

    const invalidLoginCases = [
      { 
        name: 'non-existent email', 
        payload: { email: 'nonexistent@example.com', password: 'AnyPassword123!' },
        expectedStatus: 401
      },
      { 
        name: 'incorrect password', 
        payload: { email: 'login@example.com', password: 'WrongPassword123!' },
        expectedStatus: 401
      },
      { 
        name: 'empty email', 
        payload: { email: '', password: 'ValidPassword123!' },
        expectedStatus: 400
      }
    ];

    invalidLoginCases.forEach(testCase => {
      it(`should fail login with ${testCase.name}`, async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase.payload);

        expect(response.statusCode).toBe(testCase.expectedStatus);
      });
    });
  });

  // Enhanced Registration Tests
  describe('Registration Advanced Scenarios', () => {
    // Edge Case: Extremely Long Inputs
    it('should handle extremely long inputs', async () => {
      const longString = 'a'.repeat(1000);
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `${longString}@example.com`,
          password: longString,
          name: longString,
          firstName: longString,
          lastName: longString
        });

      expect(response.statusCode).toBe(400);
    });

    // Security: Prevent Script Injection
    it('should sanitize inputs and prevent script injection', async () => {
      const scriptPayload = '<script>alert("hacked")</script>';
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'StrongPass123!',
          name: scriptPayload,
          firstName: scriptPayload,
          lastName: scriptPayload
        });

      expect(response.statusCode).toBe(201);
      // Ensure script tags are removed or escaped
      expect(response.body.user.name).not.toContain('<script>');
    });

    // Rate Limiting Test
    it('should implement registration rate limiting', async () => {
      const baseEmail = 'ratelimit@example.com';
      
      // Attempt multiple registrations
      const registrationPromises = Array(10).fill().map((_, index) => 
        request(app)
          .post('/api/auth/register')
          .send({
            email: `${baseEmail}${index}`,
            password: 'StrongPass123!',
            name: `Test User ${index}`,
            firstName: 'Test',
            lastName: 'User'
          })
      );

      const responses = await Promise.all(registrationPromises);
      
      // Some requests should be rate-limited
      const failedResponses = responses.filter(r => r.statusCode === 429);
      expect(failedResponses.length).toBeGreaterThan(0);
    });
  });

  // Enhanced Login Tests
  describe('Login Advanced Scenarios', () => {
    // Setup a verified user for login tests
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('ComplexPass123!', 10);
      await User.create({
        email: 'securelogin@example.com',
        password: hashedPassword,
        name: 'Secure Login User',
        username: 'secureloginuser',
        firstName: 'Secure',
        lastName: 'User',
        isVerified: true
      });
    });

    // Account Lockout Test
    it('should implement account lockout after multiple failed attempts', async () => {
      const email = 'securelogin@example.com';
      
      // Simulate multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'WrongPassword123!'
          });
      }

      // Attempt login with correct credentials
      const lockedResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'ComplexPass123!'
        });

      expect(lockedResponse.statusCode).toBe(403);
      expect(lockedResponse.body.message).toContain('Account locked');
    });

    // Unverified Account Login Prevention
    it('should prevent login for unverified accounts', async () => {
      // Create an unverified user
      const hashedPassword = await bcrypt.hash('UnverifiedPass123!', 10);
      await User.create({
        email: 'unverified@example.com',
        password: hashedPassword,
        name: 'Unverified User',
        username: 'unverifieduser',
        firstName: 'Unverified',
        lastName: 'User',
        isVerified: false
      });

      // Attempt login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'UnverifiedPass123!'
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Email not verified');
    });
  });

  // Password Reset Flow Tests
  describe('Password Reset Flow', () => {
    let resetToken;

    beforeEach(async () => {
      // Create a user for password reset tests
      const hashedPassword = await bcrypt.hash('OldPassword123!', 10);
      await User.create({
        email: 'reset@example.com',
        password: hashedPassword,
        name: 'Reset User',
        username: 'resetuser',
        firstName: 'Reset',
        lastName: 'User',
        isVerified: true
      });
    });

    it('should generate password reset token', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      expect(response.statusCode).toBe(200);
      expect(response.body.resetToken).toBeTruthy();
      resetToken = response.body.resetToken;
    });

    it('should reset password with valid token', async () => {
      // First, generate reset token
      const tokenResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' });

      const resetToken = tokenResponse.body.resetToken;

      // Then reset password
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword456!'
        });

      expect(resetResponse.statusCode).toBe(200);
      expect(resetResponse.body.message).toBe('Password reset successful');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reset@example.com',
          password: 'NewPassword456!'
        });

      expect(loginResponse.statusCode).toBe(200);
    });

    it('should prevent password reset with expired token', async () => {
      // Simulate an expired token
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-fake-token',
          newPassword: 'NewPassword456!'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid or expired token');
    });
  });

  // Email Verification Tests
  describe('Email Verification', () => {
    it('should send verification email', async () => {
      // Register a user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'verify@example.com',
          password: 'StrongPass123!',
          name: 'Verify User',
          firstName: 'Verify',
          lastName: 'User'
        });

      // Verify email was sent
      expect(registerResponse.body.verificationToken).toBeTruthy();
    });

    it('should verify email with correct token', async () => {
      // Register a user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'verify2@example.com',
          password: 'StrongPass123!',
          name: 'Verify User 2',
          firstName: 'Verify',
          lastName: 'User'
        });

      const verificationToken = registerResponse.body.verificationToken;

      // Verify email
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken });

      expect(verifyResponse.statusCode).toBe(200);
      expect(verifyResponse.body.message).toBe('Email verified successfully');
    });
  });
});
