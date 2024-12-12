require('dotenv').config({ path: '../../../.env' });

module.exports = {
  development: {
    username: 'postgres',
    password: 'whale',
    database: 'celestial',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: 'whale',
    database: 'celestial_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  }
};
