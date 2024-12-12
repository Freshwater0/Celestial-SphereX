require('dotenv').config();
const { Client } = require('pg');

async function inspectDatabaseSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'celestial',
    user: 'postgres',
    password: 'whale'
  });

  try {
    await client.connect();

    // List all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    console.log('Tables in the database:');
    tablesResult.rows.forEach(row => {
      console.log(row.tablename);
    });

    // Inspect table schemas
    for (const row of tablesResult.rows) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${row.tablename}'
      `);

      console.log(`\nColumns for table ${row.tablename}:`);
      columnsResult.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await client.end();
  }
}

inspectDatabaseSchema();
