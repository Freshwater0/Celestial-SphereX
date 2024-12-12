require('dotenv').config();
const { Client } = require('pg');
const url = require('url');

function validateConnectionString(connectionString) {
  try {
    const parsedUrl = new url.URL(connectionString);
    
    console.log('🔍 Connection String Validation:');
    console.log('Protocol:', parsedUrl.protocol);
    console.log('Username:', parsedUrl.username);
    console.log('Password:', parsedUrl.password ? '****' : 'No password');
    console.log('Hostname:', parsedUrl.hostname);
    console.log('Port:', parsedUrl.port);
    console.log('Pathname:', parsedUrl.pathname);
    
    return true;
  } catch (error) {
    console.error('❌ Invalid Connection String:', error.message);
    return false;
  }
}

async function testSupabaseConnection() {
  const connectionString = 'postgresql://postgres:Whale55##@postgres.lrbcdcqhrbqvgqkjgpdw.supabase.co:6543/postgres';
  
  // Validate connection string
  if (!validateConnectionString(connectionString)) {
    console.error('Connection string validation failed');
    return;
  }

  try {
    const client = new Client({
      connectionString: connectionString,
      ssl: { 
        rejectUnauthorized: false  // Careful in production
      }
    });

    console.log('\n🌐 Attempting Supabase Connection...');
    await client.connect();
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Successfully Connected to Supabase');
    console.log('Current Database Time:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection Failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testSupabaseConnection();
