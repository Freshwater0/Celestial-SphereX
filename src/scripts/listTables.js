const { sequelize } = require('../config/database');

async function listTables() {
    try {
        // Connect to the database
        await sequelize.authenticate();
        console.log('Connected to celestial database');

        // Query to list all tables
        const [tables] = await sequelize.query(`
            SELECT 
                table_name,
                pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"')) as size,
                (SELECT count(*) FROM information_schema.columns WHERE table_name=tables.table_name) as columns
            FROM information_schema.tables tables
            WHERE table_schema = 'public'
            ORDER BY pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') DESC;
        `);

        console.log('\nTables in celestial database:');
        console.table(tables);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

listTables();
