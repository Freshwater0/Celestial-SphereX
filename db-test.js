require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

console.log('Connecting to database with the following details:');
console.log('User:', process.env.DB_USER);
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

async function testConnection() {
    try {
        await client.connect();
        console.log('Database connection successful!');
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await client.end();
    }
}

testConnection();
