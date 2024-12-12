const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Load database configuration
const config = require('../src/config/config.js')['development'];

// Create Sequelize instance
const sequelize = new Sequelize(config);

async function runMigration(migrationFile) {
  try {
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../src/migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await sequelize.query(migrationSQL);
    console.log(`Migration ${migrationFile} successful`);
  } catch (error) {
    console.error(`Migration ${migrationFile} failed:`, error);
  }
}

async function runAllMigrations() {
  try {
    // Run user table migrations
    await runMigration('20240107-add-user-columns.sql');
    
    // Run settings table migrations
    await runMigration('20240107-add-settings-columns.sql');
  } catch (error) {
    console.error('Migrations failed:', error);
  } finally {
    await sequelize.close();
  }
}

runAllMigrations();
