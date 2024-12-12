require('dotenv').config();
const { Client } = require('pg');

async function testSupabaseConnection() {
  const connectionConfig = {
    user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    database: 'CelestialSphereX',
    password: 'Whale55##',
    port: 6543,
    ssl: {
      rejectUnauthorized: false,
    },
    // Add additional connection parameters for debugging
    connectionTimeoutMillis: 10000,  // 10 seconds timeout
    statement_timeout: 5000,  // 5 seconds statement timeout
  };

  console.log('🌐 Attempting Supabase Connection...');
  console.log('Connection Details:', JSON.stringify(connectionConfig, null, 2));

  try {
    const client = new Client(connectionConfig);
    
    // Detailed event logging
    client.on('error', (err) => {
      console.error('📛 Client Error Event:', {
        message: err.message,
        name: err.name,
        code: err.code,
        detail: err.detail
      });
    });

    await client.connect();
    console.log('✅ Successfully Connected to Supabase');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current Database Time:', result.rows[0].now);
    
    // Comprehensive database information gathering
    try {
      const schemaResult = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata
      `);
      console.log('📊 Database Schemas:');
      schemaResult.rows.forEach(row => {
        console.log('- ' + row.schema_name);
      });

      const tablesResult = await client.query(`
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('📋 Tables in Public Schema:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_schema}.${row.table_name}`);
      });
    } catch (infoError) {
      console.error('❌ Error gathering database info:', {
        message: infoError.message,
        code: infoError.code
      });
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection Attempt Failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint,
      fullError: error
    });
  }
}

// Run the connection test
testSupabaseConnection();
