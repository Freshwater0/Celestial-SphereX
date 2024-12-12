const path = require('path');
require('dotenv').config({ path: 'c:/Users/tshoj/celestial-sphere/backend/.env' });
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function loginTestUser() {
  try {
    // Find the user
    const user = await User.findOne({ 
      where: { email: 'known@example.com' } 
    });

    if (!user) {
      console.error('User not found');
      return null;
    }

    console.log('User found:', user.toJSON());
    console.log('Stored Hashed Password:', user.password);

    // Direct bcrypt comparison
    const directBcryptCompare = await bcrypt.compare('testpassword', user.password);
    console.log('Direct Bcrypt Comparison Result:', directBcryptCompare);

    // Validate password using the instance method
    const isPasswordValid = await user.validatePassword('testpassword');
    console.log('Instance Method Password Validation Result:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('Invalid password');
      return null;
    }

    // Generate access token
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRATION 
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION 
      }
    );

    console.log('Login Successful!');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      accessToken,
      refreshToken
    };

  } catch (error) {
    console.error('Login error:', error);
    return null;
  } finally {
    await sequelize.close();
  }
}

loginTestUser();
