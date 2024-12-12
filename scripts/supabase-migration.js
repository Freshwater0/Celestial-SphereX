const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function migrateDatabaseToSupabase() {
  console.log('🚀 Starting Supabase Database Migration');

  // Source Database Configuration
  const sourceClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'celestial',
    user: 'postgres',
    password: 'whale'
  });

  // Supabase Client
  const supabaseClient = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Tables to migrate (in order to handle dependencies)
  const tablesToMigrate = [
    'Users',     // Users first
    'Profiles',  // Then profiles
    'Settings',  // User settings
    'Session',   // Sessions
    'Widget',    // Widgets
    'Notification', // Notifications
    'Report',    // Reports
    'crypto_watchlists', // Crypto watchlists
    'activity_logs', // Activity logs
    'api_usages', // API usage logs
    'subscriptions', // Subscriptions
    'email_verifications' // Email verifications
  ];

  try {
    // Connect to source database
    await sourceClient.connect();

    for (const table of tablesToMigrate) {
      console.log(`\n🔄 Migrating table: ${table}`);

      try {
        // Fetch all data from source table
        const { rows } = await sourceClient.query(`SELECT * FROM "${table}"`);

        if (rows.length === 0) {
          console.log(`⚠️ No data to migrate in ${table}`);
          continue;
        }

        console.log(`📊 Found ${rows.length} rows in ${table}`);

        // Bulk upsert into Supabase
        const { data, error } = await supabaseClient
          .from(table.toLowerCase())  // Convert to lowercase for Supabase
          .upsert(rows, { 
            onConflict: 'id',
            returning: 'minimal'
          });

        if (error) {
          console.error(`❌ Error migrating ${table}:`, error);
        } else {
          console.log(`✅ Successfully migrated ${table}: ${rows.length} rows`);
        }
      } catch (tableError) {
        console.error(`❌ Error processing table ${table}:`, tableError);
      }
    }

  } catch (error) {
    console.error('🚨 Migration failed:', error);
  } finally {
    // Close database connection
    await sourceClient.end();
  }

  console.log('🎉 Supabase Migration Completed');
}

// Run migration
migrateDatabaseToSupabase()
  .then(() => console.log('Migration process finished successfully'))
  .catch(console.error);
