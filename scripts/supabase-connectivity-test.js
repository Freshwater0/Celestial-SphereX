const net = require('net');

function testConnectivity(host, port) {
  return new Promise((resolve, reject) => {
    console.log(`🌐 Testing connectivity to ${host}:${port}`);
    
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.connect(port, host, () => {
      console.log('✅ Connection Successful');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log('❌ Connection Timed Out');
      socket.destroy();
      reject(new Error('Connection Timeout'));
    });
    
    socket.on('error', (err) => {
      console.log('❌ Connection Error:', err.message);
      socket.destroy();
      reject(err);
    });
  });
}

// Test Supabase connection details
async function runConnectivityTests() {
  const tests = [
    { 
      host: 'aws-0-ap-southeast-2.pooler.supabase.com', 
      port: 6543 
    }
  ];

  for (const test of tests) {
    try {
      await testConnectivity(test.host, test.port);
    } catch (error) {
      console.error(`Failed to connect to ${test.host}:${test.port}`);
    }
  }
}

runConnectivityTests();
