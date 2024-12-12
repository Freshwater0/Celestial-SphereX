const axios = require('axios');
const jwt = require('jsonwebtoken');

describe('SITe Authentication Flow', () => {
  const baseUrl = 'http://localhost:5000/api/auth';
  
  test('Site Login Endpoint', async () => {
    // Simulate a user from SITe
    const siteUserData = {
      siteUserId: 'site_test_user_123',
      email: 'testuser@site.com'
    };

    try {
      const response = await axios.post(`${baseUrl}/site-login`, siteUserData);
      
      console.log('Login Response:', response.data);
      
      // Check response structure
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('redirectUrl');

      // Verify the token
      const token = new URL(response.data.redirectUrl).searchParams.get('token');
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decodedToken).toHaveProperty('email', siteUserData.email);
      expect(decodedToken).toHaveProperty('source', 'site_login');
    } catch (error) {
      console.error('Test failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  });

  test('Token Validation Endpoint', async () => {
    // First, get a valid token
    const siteUserData = {
      siteUserId: 'site_test_user_456',
      email: 'anothertest@site.com'
    };

    const loginResponse = await axios.post(`${baseUrl}/site-login`, siteUserData);
    const token = new URL(loginResponse.data.redirectUrl).searchParams.get('token');

    // Now validate the token
    try {
      const validationResponse = await axios.get(`${baseUrl}/validate-site-token?token=${token}`);
      
      console.log('Token Validation Response:', validationResponse.data);
      
      expect(validationResponse.status).toBe(200);
      expect(validationResponse.data).toHaveProperty('valid', true);
      expect(validationResponse.data.user).toHaveProperty('email', siteUserData.email);
    } catch (error) {
      console.error('Validation test failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  });
});

// Add error case tests
describe('SITe Authentication Error Handling', () => {
  const baseUrl = 'http://localhost:5000/api/auth';
  
  test('Invalid Token Validation', async () => {
    try {
      const invalidToken = 'clearly.invalid.token';
      const validationResponse = await axios.get(`${baseUrl}/validate-site-token?token=${invalidToken}`);
      
      // This should throw an error
      fail('Expected an error for invalid token');
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('valid', false);
    }
  });
});
