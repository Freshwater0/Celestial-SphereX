require('dotenv').config();

function formatSupabaseConnectionString(projectId, password) {
  const connectionString = `postgresql://postgres.${projectId}:${password}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`;
  
  console.log('🔗 Formatted Connection String:');
  console.log(connectionString);
  
  return connectionString;
}

// Use the details you previously shared
const projectId = 'lrbcdcqhrbqvgqkjgpdw';
const password = 'Whale55##';

formatSupabaseConnectionString(projectId, password);
