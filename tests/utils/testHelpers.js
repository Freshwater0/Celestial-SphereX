const jwt = require('jsonwebtoken');
const { User } = require('../../src/models');

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!'
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return user;
};

const generateTestToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const clearDatabase = async () => {
  await User.destroy({ where: {}, force: true });
};

module.exports = {
  createTestUser,
  generateTestToken,
  clearDatabase
};
