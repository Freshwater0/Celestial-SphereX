const { Sequelize } = require('sequelize');
const { config } = require('../config/database');

async function listDatabases() {
    // Connect to the default 'postgres' database to list all databases
    const sequelize = new Sequelize({
        host: config.development.host,
        port: config.development.port,
        username: config.development.username,
        password: config.development.password,
        database: 'postgres',
        dialect: 'postgres',
        logging: false
    });

    try {
        // Connect to PostgreSQL
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        // Query to list all databases
        const [results] = await sequelize.query(`
            SELECT datname as database_name, 
                   pg_size_pretty(pg_database_size(datname)) as size,
                   pg_catalog.pg_get_userbyid(datdba) as owner
            FROM pg_database
            WHERE datistemplate = false
            ORDER BY pg_database_size(datname) DESC;
        `);

        console.log('\nAvailable Databases:');
        console.table(results);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

listDatabases();
