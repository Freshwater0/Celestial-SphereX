const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

function parseConnectionString(connectionString) {
  // Default fallback values
  const defaults = {
    host: 'localhost',
    port: 5432,
    database: 'celestial',
    user: 'postgres',
    password: 'whale'
  };

  try {
    // Split the connection string
    const [protocol, rest] = connectionString.split('://');
    const [credentials, hostAndDb] = rest.split('@');
    
    const [user, password] = credentials.split(':');
    const [hostPortDb] = hostAndDb.split('/');
    const [host, port] = hostPortDb.split(':');
    
    return {
      host: host || defaults.host,
      port: parseInt(port || defaults.port),
      database: 'celestial', // Hardcoded for now
      user: user || defaults.user,
      password: password || defaults.password
    };
  } catch (error) {
    console.warn('Failed to parse connection string, using defaults:', error);
    return defaults;
  }
}

async function migrateDatabaseToSupabase() {
  console.log('Environment Variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
  });

  // Parse connection details
  const connectionConfig = parseConnectionString(
    process.env.DATABASE_URL || 'postgresql://postgres:whale@localhost:5432/celestial'
  );

  console.log('Parsed Connection Config:', connectionConfig);

  // Source Database (Local PostgreSQL)
  const sourceClient = new Client(connectionConfig);

  // Supabase Destination
  const supabaseClient = createClient(
    process.env.SUPABASE_URL || '', 
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    // Connect to source database
    await sourceClient.connect();

    // Fetch all table names, case-insensitive
    const { rows: tableRows } = await sourceClient.query(`
      SELECT DISTINCT lower(tablename) as tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
      AND tablename NOT LIKE 'sequelize%'
    `);

    const tables = [...new Set(tableRows.map(row => row.tablename))];
    console.log('Tables to migrate:', tables);

    for (const table of tables) {
      console.log(`Migrating table: ${table}`);

      try {
        // Dynamic query to handle case variations
        const { rows } = await sourceClient.query(`SELECT * FROM "${table}"`);

        if (rows.length === 0) {
          console.log(`No data to migrate in ${table}`);
          continue;
        }

        // Bulk insert into Supabase
        const { data, error } = await supabaseClient
          .from(table)
          .upsert(rows, { 
            onConflict: 'id',
            returning: 'minimal'
          });

        if (error) {
          console.error(`Error migrating ${table}:`, error);
        } else {
          console.log(`Successfully migrated ${table}: ${rows.length} rows`);
        }
      } catch (tableError) {
        console.error(`Error processing table ${table}:`, tableError);
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await sourceClient.end();
  }
}

// Run migration
migrateDatabaseToSupabase()
  .then(() => console.log('Migration completed successfully'))
  .catch(console.error);
