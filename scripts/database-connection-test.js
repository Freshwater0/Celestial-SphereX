const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Redundant Connection Configurations
const connectionConfigs = [
  {
    id: 'primary',
    user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    database: 'postgres',
    password: 'Whale55##',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  },
  {
    id: 'secondary',
    user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    database: 'postgres',
    password: 'Whale55##',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  }
];

// Logging and State Management
class DatabaseConnectionManager {
  constructor(configs) {
    this.configs = configs;
    this.connectionLog = path.join(__dirname, 'connection_log.json');
    this.currentConnectionIndex = 0;
  }

  // Persist connection state
  async logConnectionAttempt(config, success, error = null) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        connectionId: config.id,
        success,
        error: error ? error.message : null
      };

      let logs = [];
      try {
        logs = JSON.parse(fs.readFileSync(this.connectionLog, 'utf8'));
      } catch (readError) {
        // File might not exist on first run
      }

      logs.push(logEntry);
      
      // Keep only last 100 log entries
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }

      fs.writeFileSync(this.connectionLog, JSON.stringify(logs, null, 2));
    } catch (logError) {
      console.error('Failed to log connection attempt:', logError);
    }
  }

  // Rotate through connection configs
  getNextConfig() {
    this.currentConnectionIndex = 
      (this.currentConnectionIndex + 1) % this.configs.length;
    return this.configs[this.currentConnectionIndex];
  }

  async testConnection(config) {
    const client = new Client(config);
    
    try {
      await client.connect();
      const result = await client.query('SELECT NOW()');
      console.log(`✅ Connection Successful for ${config.id}`);
      console.log('Database Time:', result.rows[0].now);
      
      // Log successful connection
      await this.logConnectionAttempt(config, true);
      
      return { success: true, client };
    } catch (error) {
      console.error(`❌ Connection Failed for ${config.id}:`, error.message);
      
      // Log failed connection
      await this.logConnectionAttempt(config, false, error);
      
      // Close the client if connection failed
      try {
        await client.end();
      } catch {}
      
      return { success: false, error };
    }
  }

  async performRedundantConnectionTest() {
    console.log('🔄 Starting Redundant Connection Tests');
    
    for (let attempt = 1; attempt <= this.configs.length; attempt++) {
      const currentConfig = this.getNextConfig();
      console.log(`\n🌐 Attempt ${attempt}: Testing ${currentConfig.id} Connection`);
      
      const connectionResult = await this.testConnection(currentConfig);
      
      if (connectionResult.success) {
        // Perform additional tests on successful connection
        try {
          const client = connectionResult.client;
          
          // Concurrent Queries Test
          const concurrentQueries = [
            client.query('SELECT COUNT(*) FROM pg_tables'),
            client.query('SELECT version()'),
            client.query('SELECT current_database()')
          ];
          
          const concurrentResults = await Promise.all(concurrentQueries);
          console.log('✅ Concurrent Queries Successful');
          concurrentResults.forEach((result, index) => {
            console.log(`Query ${index + 1} Result:`, result.rows[0]);
          });
          
          // Close the client
          await client.end();
        } catch (queryError) {
          console.error('Additional Query Tests Failed:', queryError);
        }
        
        return true;
      }
    }
    
    console.error('❌ All Connection Attempts Failed');
    return false;
  }
}

class ConcurrentConnectionTester {
  constructor(configs, userCount = 100, testDurationMinutes = 30) {
    this.configs = configs;
    this.userCount = userCount;
    this.testDurationMinutes = testDurationMinutes;
    this.connectionLog = path.join(__dirname, 'concurrent_connection_log.json');
    this.statsLog = path.join(__dirname, 'concurrent_connection_stats.json');
  }

  async createClient(config) {
    const client = new Client(config);
    await client.connect();
    return client;
  }

  async simulateUserQuery(client, userId) {
    const startTime = Date.now();
    try {
      // Simulate different types of queries with varying complexity
      const queries = [
        client.query('SELECT NOW()'),
        client.query('SELECT COUNT(*) FROM pg_tables'),
        client.query('SELECT version()'),
        // Add a slightly more complex query
        client.query(`
          SELECT 
            (SELECT COUNT(*) FROM pg_tables) as table_count,
            (SELECT COUNT(*) FROM pg_namespace) as namespace_count,
            NOW() as current_time
        `)
      ];
      
      const results = await Promise.all(queries);
      
      const endTime = Date.now();
      return {
        userId,
        success: true,
        queryTime: endTime - startTime,
        results: results.map(r => r.rows[0])
      };
    } catch (error) {
      return {
        userId,
        success: false,
        error: error.message,
        errorType: error.constructor.name
      };
    }
  }

  async runConcurrentTest() {
    console.log(`🌐 Starting Comprehensive Concurrent Connection Test for ${this.userCount} Users`);
    const startTime = Date.now();
    
    // Enhanced connection pool management
    const connectionPools = this.configs.map(config => ({
      config,
      clients: [],
      activeConnections: 0
    }));

    try {
      // Create connection pools with load balancing
      for (const pool of connectionPools) {
        const poolSize = Math.ceil(this.userCount / this.configs.length);
        for (let i = 0; i < poolSize; i++) {
          const client = await this.createClient(pool.config);
          pool.clients.push(client);
        }
      }

      // Flatten and slice clients to exact user count
      const allClients = connectionPools.flatMap(pool => pool.clients).slice(0, this.userCount);
      
      console.log(`📊 Created ${allClients.length} database connections`);

      // Simulate concurrent user queries
      const testEndTime = startTime + (this.testDurationMinutes * 60 * 1000);
      const testResults = [];
      const errorLog = [];
      
      while (Date.now() < testEndTime) {
        // Simulate load with concurrent queries
        const concurrentQueries = allClients.map((client, index) => 
          this.simulateUserQuery(client, index)
            .catch(error => {
              // Capture any unexpected errors
              errorLog.push({
                timestamp: new Date().toISOString(),
                error: error.message,
                errorType: error.constructor.name
              });
              return {
                userId: index,
                success: false,
                error: error.message
              };
            })
        );
        
        const iterationResults = await Promise.all(concurrentQueries);
        
        // Batch process results to prevent stack overflow
        const batchSize = 1000;
        for (let i = 0; i < iterationResults.length; i += batchSize) {
          const batch = iterationResults.slice(i, i + batchSize);
          testResults.push(...batch);
        }
        
        // Adaptive wait to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Analyze results with batched processing
      const stats = this.analyzeResultsBatched(testResults);
      
      // Add error log to stats if any errors occurred
      if (errorLog.length > 0) {
        stats.errorLog = errorLog;
      }
      
      // Log stats
      fs.writeFileSync(this.statsLog, JSON.stringify(stats, null, 2));
      
      console.log('🏁 Concurrent Connection Test Completed');
      console.log('📈 Test Statistics:', stats);

      return stats;
    } catch (error) {
      console.error('❌ Concurrent Connection Test Failed:', error);
      throw error;
    } finally {
      // Cleanup: close all clients
      for (const pool of connectionPools) {
        for (const client of pool.clients) {
          try {
            await client.end();
          } catch {}
        }
      }
    }
  }

  analyzeResultsBatched(results) {
    // Batched analysis to prevent stack overflow
    let totalQueries = 0;
    let successfulQueries = 0;
    let failedQueries = 0;
    let totalQueryTime = 0;
    let maxQueryTime = 0;
    let minQueryTime = Infinity;
    const failureReasons = new Set();

    for (const result of results) {
      totalQueries++;

      if (result.success) {
        successfulQueries++;
        totalQueryTime += result.queryTime;
        maxQueryTime = Math.max(maxQueryTime, result.queryTime);
        minQueryTime = Math.min(minQueryTime, result.queryTime);
      } else {
        failedQueries++;
        failureReasons.add(result.error);
      }
    }

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      successRate: (successfulQueries / totalQueries) * 100,
      avgQueryTime: successfulQueries > 0 ? totalQueryTime / successfulQueries : 0,
      maxQueryTime: maxQueryTime === 0 ? null : maxQueryTime,
      minQueryTime: minQueryTime === Infinity ? null : minQueryTime,
      failureReasons: Array.from(failureReasons)
    };
  }
}

// Run the concurrent connection test
async function runConcurrentConnectionTest() {
  const tester = new ConcurrentConnectionTester(connectionConfigs);
  await tester.runConcurrentTest();
}

// Execute the tests
runConcurrentConnectionTest();
