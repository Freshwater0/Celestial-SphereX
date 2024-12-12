require('dotenv').config();
const { Client } = require('pg');

async function testSupabaseConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('🔍 Diagnostic Information:');
  console.log('Full Connection String:', connectionString);

  try {
    // Create a new PostgreSQL client
    const client = new Client({ 
      connectionString,
      // Add extra options for robustness
      ssl: {
        rejectUnauthorized: false  // Use carefully in production
      }
    });

    // Connect to the database
    await client.connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL');

    // Run a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Current Database Time:', result.rows[0].now);

    // Close the connection
    await client.end();

  } catch (error) {
    console.error('❌ Connection Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testSupabaseConnection();
