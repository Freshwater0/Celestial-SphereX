const fs = require('fs');
const crypto = require('crypto');

// Simulate user login process
class LoginSimulation {
  constructor() {
    this.users = this.loadUsers(); // Load users from a mock data file
  }

  // Load mock user data
  loadUsers() {
    // Mock user data for simulation
    return [
      { email: 'testuser1@celestialspherex.com', password: 'password123' },
      { email: 'testuser2@celestialspherex.com', password: 'password456' }
    ];
  }

  // Simulate user login
  simulateLogin(email, password) {
    const user = this.users.find(u => u.email === email);

    if (!user) {
      console.log('🚫 Login failed: User not found');
      return false;
    }

    if (user.password === password) {
      console.log(`🎉 Login successful for ${email}`);
      return true;
    } else {
      console.log('🚫 Login failed: Incorrect password');
      return false;
    }
  }
}

// Execute login simulation
const loginSimulation = new LoginSimulation();

// Test login with mock data
const testEmail = 'testuser1@celestialspherex.com';
const testPassword = 'password123';
loginSimulation.simulateLogin(testEmail, testPassword);

// Test with incorrect password
const incorrectPassword = 'wrongpassword';
loginSimulation.simulateLogin(testEmail, incorrectPassword);

// Test with non-existent user
const nonExistentEmail = 'nonexistent@celestialspherex.com';
loginSimulation.simulateLogin(nonExistentEmail, testPassword);
