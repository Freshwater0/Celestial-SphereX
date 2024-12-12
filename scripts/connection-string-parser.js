function parseConnectionString(connectionString) {
  try {
    // Remove postgresql:// prefix
    const cleanString = connectionString.replace('postgresql://', '');
    
    // Split into user:password and host/database parts
    const [credentials, hostPath] = cleanString.split('@');
    const [username, password] = credentials.split(':');
    
    // Split host/database part
    const [hostPort, database] = hostPath.split('/');
    const [host, port] = hostPort.split(':');
    
    console.log('🔍 Connection String Breakdown:');
    console.log('Username:', username);
    console.log('Password:', password ? '****' : 'No password');
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Database:', database);
    
    return { username, password, host, port, database };
  } catch (error) {
    console.error('❌ Error parsing connection string:', error.message);
    return null;
  }
}

// Parse the connection string from environment
require('dotenv').config();
parseConnectionString(process.env.DATABASE_URL);
