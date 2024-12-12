const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

// Disable logging during tests
logger.silent = true;

beforeAll(async () => {
  // Wait for database connection
  try {
    await sequelize.authenticate();
    // Sync database in test environment
    if (process.env.NODE_ENV === 'test') {
      await sequelize.sync({ force: true });
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  await sequelize.close();
});
