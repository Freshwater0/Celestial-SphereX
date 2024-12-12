const https = require('https');

function checkSupabaseProjectStatus(projectRef) {
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectRef}/status`,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const projectStatus = JSON.parse(data);
        console.log('🔍 Supabase Project Status:');
        console.log('Project Reference:', projectRef);
        console.log('Status:', projectStatus.status || 'Unknown');
        console.log('Details:', JSON.stringify(projectStatus, null, 2));
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.end();
}

// Check status for the project
checkSupabaseProjectStatus('lrbcdcqhrbqvgqkjgpdw');
