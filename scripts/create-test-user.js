const path = require('path');
require('dotenv').config({ path: 'c:/Users/tshoj/celestial-sphere/backend/.env' });
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    // Sync database models
    await sequelize.sync();

    const [user, created] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        username: 'testuser_' + Date.now(), // Add timestamp to ensure uniqueness
        email: 'test@example.com',
        password: await User.hashPassword('testpassword'),
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isVerified: true
      }
    });

    if (created) {
      console.log('Test user created successfully:', user.toJSON());
    } else {
      console.log('Test user already exists:', user.toJSON());
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

createTestUser();
