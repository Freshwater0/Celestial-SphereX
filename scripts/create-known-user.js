const path = require('path');
require('dotenv').config({ path: 'c:/Users/tshoj/celestial-sphere/backend/.env' });
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

async function createKnownUser() {
  try {
    // Sync database models
    await sequelize.sync();

    // Delete existing user if exists
    await User.destroy({
      where: { email: 'known@example.com' }
    });

    // Create new user using the model's create method to leverage hooks
    const user = await User.create({
      username: 'knownuser_' + Date.now(),
      email: 'known@example.com',
      password: 'testpassword', // This will be hashed by the beforeCreate hook
      firstName: 'Known',
      lastName: 'User',
      role: 'user',
      isVerified: true
    });

    console.log('Known test user created successfully:', user.toJSON());
    console.log('Stored Hashed Password:', user.password);
  } catch (error) {
    console.error('Error creating known user:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

createKnownUser();
