require('dotenv').config();
const { Client } = require('pg');

async function testDatabaseConnection() {
  console.log('Database Connection Details:');
  console.log('Full DATABASE_URL:', process.env.DATABASE_URL);
  
  const connectionString = process.env.DATABASE_URL;
  
  try {
    const client = new Client({ connectionString });
    await client.connect();
    console.log('Successfully connected to the database!');
    
    // Test basic query
    const result = await client.query('SELECT NOW()');
    console.log('Current Database Time:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('Connection Error:', error);
    console.error('Error Details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testDatabaseConnection();
