require('dotenv').config();

function validatePostgresURL(url) {
  console.log('Full DATABASE_URL:', url);
  
  try {
    const parsedUrl = new URL(url);
    
    console.log('Parsed URL Components:');
    console.log('Protocol:', parsedUrl.protocol);
    console.log('Username:', parsedUrl.username);
    console.log('Password:', parsedUrl.password ? '****' : 'NO PASSWORD');
    console.log('Hostname:', parsedUrl.hostname);
    console.log('Port:', parsedUrl.port);
    console.log('Pathname:', parsedUrl.pathname);
    
    // Validate key components
    if (!parsedUrl.protocol.startsWith('postgresql')) {
      throw new Error('Invalid protocol. Must start with postgresql://');
    }
    
    if (!parsedUrl.hostname) {
      throw new Error('Missing hostname');
    }
    
    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      throw new Error('Missing database name in connection string');
    }
    
    console.log('✅ Connection string appears valid');
    return true;
  } catch (error) {
    console.error('❌ Invalid connection string:', error.message);
    return false;
  }
}

validatePostgresURL(process.env.DATABASE_URL || '');
