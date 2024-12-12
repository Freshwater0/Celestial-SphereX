const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with database connection parameters
const sequelize = new Sequelize(
  process.env.DB_NAME || 'celestial',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'whale',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
