const { sequelize, testConnection } = require('../config/database');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');
        
        // Test the connection
        await testConnection();
        
        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

initializeDatabase();
