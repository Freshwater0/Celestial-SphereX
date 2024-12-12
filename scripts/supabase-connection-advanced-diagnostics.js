require('dotenv').config();
const { Client } = require('pg');

// Supabase Connection Configuration
const supabaseConfig = {
  host: 'postgres.lrbcdcqhrbqvgqkjgpdw.supabase.co',
  port: 6543,
  database: 'postgres',
  user: 'postgres',
  password: 'Whale55##',
  ssl: {
    rejectUnauthorized: false,
    // You might need to add additional SSL configuration
  }
};

async function testSupabaseConnection() {
  console.log('🌐 Attempting Supabase Connection...');
  console.log('Connection Details:');
  console.log('Host:', supabaseConfig.host);
  console.log('Port:', supabaseConfig.port);
  console.log('Database:', supabaseConfig.database);
  console.log('User:', supabaseConfig.user);

  try {
    const client = new Client(supabaseConfig);
    
    await client.connect();
    console.log('✅ Successfully Connected to Supabase');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current Database Time:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection Failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      fullError: error
    });
  }
}

// Run the connection test
testSupabaseConnection();
