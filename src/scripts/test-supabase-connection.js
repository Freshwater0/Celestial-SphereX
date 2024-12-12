const { Pool } = require('pg');

async function testSupabaseConnection() {
  try {
    // Construct connection string manually
    const connectionParams = {
      user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
      password: 'Whale55##',
      host: 'aws-0-ap-southeast-2.pooler.supabase.com',
      port: 6543,
      database: 'postgres'
    };

    console.log('Supabase PostgreSQL Configuration:');
    console.log('Host:', connectionParams.host);
    console.log('Port:', connectionParams.port);
    console.log('User:', connectionParams.user.substring(0, 10) + '...');
    console.log('Database:', connectionParams.database);

    const pool = new Pool({
      user: connectionParams.user,
      host: connectionParams.host,
      database: connectionParams.database,
      password: connectionParams.password,
      port: connectionParams.port,
      ssl: {
        rejectUnauthorized: false // Use this only for testing, not in production
      }
    });

    console.log('\nAttempting PostgreSQL Connection...');
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW()');
      console.log('PostgreSQL Connection Successful!');
      console.log('Current Database Time:', result.rows[0].now);

      // Check database version
      const versionResult = await client.query('SELECT version()');
      console.log('PostgreSQL Version:', versionResult.rows[0].version);

      // Optional: List schemas
      const schemasResult = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema'
      `);
      console.log('Available Schemas:', 
        schemasResult.rows.map(row => row.schema_name).join(', ')
      );
    } finally {
      client.release();
    }

    await pool.end();

    return true;
  } catch (err) {
    console.error('\nConnection Test Failed:', err);
    return false;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSupabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = testSupabaseConnection;
