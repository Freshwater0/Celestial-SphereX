const axios = require('axios');

// Function to test user login
async function testLogin(email, password) {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    console.log('Login Response:', response.data);
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
  }
}

// Test with valid credentials
const testEmail = 'testuser1@celestialspherex.com';
const testPassword = 'password123';

console.log('Testing login with valid credentials...');
testLogin(testEmail, testPassword);

// Test with invalid credentials
const invalidPassword = 'wrongpassword';
console.log('\nTesting login with invalid credentials...');
testLogin(testEmail, invalidPassword);

// Test with non-existent user
const nonExistentEmail = 'nonexistent@celestialspherex.com';
console.log('\nTesting login with non-existent user...');
testLogin(nonExistentEmail, testPassword);
