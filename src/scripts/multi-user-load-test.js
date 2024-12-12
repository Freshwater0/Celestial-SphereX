const { Pool } = require('pg');
const os = require('os');

class MultiUserLoadTest {
  constructor(config) {
    this.config = {
      host: 'aws-0-ap-southeast-2.pooler.supabase.com',
      port: 6543,
      user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
      password: 'Whale55##',
      database: 'postgres',
      numUsers: config.numUsers || 100,
      operationTypes: [
        'read_profile',
        'update_profile',
        'create_record',
        'complex_query',
        'aggregate_query'
      ],
      duration: config.duration || 60000, // 1 minute
      ...config
    };

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      max: Math.min(this.config.numUsers * 2, 100), // Limit max connections
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async prepareTestTable(client) {
    // Use a non-temporary table that we'll drop after the test
    await client.query(`
      DROP TABLE IF EXISTS load_test_users;

      CREATE TABLE load_test_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50),
        email VARCHAR(100),
        age INT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Insert some test data
      INSERT INTO load_test_users (username, email, age)
      SELECT 
        'user_' || generate_series,
        'user_' || generate_series || '@example.com',
        (random() * 50)::int + 18
      FROM generate_series(1, 1000)
      ON CONFLICT DO NOTHING;
    `);
  }

  async initializeTestTable() {
    const client = await this.pool.connect();
    try {
      await this.prepareTestTable(client);
    } finally {
      client.release();
    }
  }

  async performOperation(client, operationType) {
    const start = Date.now();
    try {
      switch(operationType) {
        case 'read_profile':
          await client.query(`
            SELECT id, username, email, age 
            FROM load_test_users 
            WHERE id = $1
          `, [Math.floor(Math.random() * 1000) + 1]);
          break;
        
        case 'update_profile':
          await client.query(`
            UPDATE load_test_users 
            SET age = $1 
            WHERE id = $2
          `, [
            Math.floor(Math.random() * 50) + 18, 
            Math.floor(Math.random() * 1000) + 1
          ]);
          break;
        
        case 'create_record':
          await client.query(`
            INSERT INTO load_test_users (username, email, age)
            VALUES ($1, $2, $3)
          `, [
            'newuser_' + Date.now(),
            'newuser_' + Date.now() + '@example.com',
            Math.floor(Math.random() * 50) + 18
          ]);
          break;
        
        case 'complex_query':
          await client.query(`
            WITH user_stats AS (
              SELECT 
                age_group, 
                COUNT(*) as user_count,
                AVG(load_test_users.age) as avg_age
              FROM (
                SELECT 
                  load_test_users.id,
                  CASE 
                    WHEN load_test_users.age < 25 THEN '18-24'
                    WHEN load_test_users.age < 35 THEN '25-34'
                    WHEN load_test_users.age < 45 THEN '35-44'
                    ELSE '45+'
                  END as age_group
                FROM load_test_users
              ) AS grouped_users
              JOIN load_test_users ON load_test_users.id = grouped_users.id
              GROUP BY age_group
            )
            SELECT * FROM user_stats
            ORDER BY user_count DESC
          `);
          break;
        
        case 'aggregate_query':
          await client.query(`
            SELECT 
              MIN(age) as min_age,
              MAX(age) as max_age,
              AVG(age) as avg_age,
              COUNT(*) as total_users
            FROM load_test_users
          `);
          break;
      }
      return Date.now() - start;
    } catch (error) {
      console.error(`Error in ${operationType}:`, error);
      return -1;
    }
  }

  async runUserSimulation() {
    console.log('🚀 Multi-User Load Test Configuration:');
    console.log(`- Number of Simulated Users: ${this.config.numUsers}`);
    console.log(`- Test Duration: ${this.config.duration}ms`);
    console.log(`- Operation Types: ${this.config.operationTypes.join(', ')}`);

    // Initialize the test table before running simulations
    await this.initializeTestTable();

    const userStats = {
      total: 0,
      successful: 0,
      failed: 0,
      operationTimes: {},
      operationCounts: {}
    };

    this.config.operationTypes.forEach(op => {
      userStats.operationTimes[op] = [];
      userStats.operationCounts[op] = 0;
    });

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    const runUserOperations = async () => {
      const client = await this.pool.connect();
      try {
        // Randomly select an operation
        const operationType = this.config.operationTypes[
          Math.floor(Math.random() * this.config.operationTypes.length)
        ];

        const duration = await this.performOperation(client, operationType);
        
        userStats.total++;
        if (duration >= 0) {
          userStats.successful++;
          userStats.operationTimes[operationType].push(duration);
          userStats.operationCounts[operationType]++;
        } else {
          userStats.failed++;
        }
      } catch (error) {
        userStats.failed++;
      } finally {
        client.release();
      }
    };

    const userPromises = [];
    while (Date.now() < endTime) {
      // Simulate concurrent user operations
      const batchPromises = [];
      for (let i = 0; i < this.config.numUsers; i++) {
        batchPromises.push(runUserOperations());
      }
      await Promise.allSettled(batchPromises);
    }

    const actualDuration = Date.now() - startTime;

    // Drop the test table after the simulation
    const cleanupClient = await this.pool.connect();
    try {
      await cleanupClient.query('DROP TABLE IF EXISTS load_test_users');
    } finally {
      cleanupClient.release();
    }

    // Calculate statistics
    console.log('\n📊 Load Test Results:');
    console.log(`- Total Operations: ${userStats.total}`);
    console.log(`- Successful Operations: ${userStats.successful}`);
    console.log(`- Failed Operations: ${userStats.failed}`);
    console.log(`- Actual Test Duration: ${actualDuration}ms`);
    console.log(`- Operations per Second: ${(userStats.total / (actualDuration / 1000)).toFixed(2)}`);

    console.log('\nOperation Performance:');
    Object.keys(userStats.operationTimes).forEach(op => {
      const times = userStats.operationTimes[op];
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`- ${op}: Count = ${userStats.operationCounts[op]}, Avg Time = ${avgTime.toFixed(2)}ms`);
      }
    });

    return {
      total: userStats.total,
      successful: userStats.successful,
      failed: userStats.failed,
      actualDuration,
      operationTimes: userStats.operationTimes,
      operationCounts: userStats.operationCounts
    };
  }

  static async run(config = {}) {
    const loadTest = new MultiUserLoadTest(config);
    
    try {
      // Initialize the test table before running the test
      const client = await loadTest.pool.connect();
      try {
        await loadTest.prepareTestTable(client);
      } finally {
        client.release();
      }

      const results = await loadTest.runUserSimulation();
      
      // Print detailed results
      console.log('\n📊 Load Test Results:');
      console.log(`- Total Operations: ${results.total}`);
      console.log(`- Successful Operations: ${results.successful}`);
      console.log(`- Failed Operations: ${results.failed}`);
      console.log(`- Actual Test Duration: ${results.actualDuration}ms`);
      console.log(`- Operations per Second: ${(results.total / (results.actualDuration / 1000)).toFixed(2)}`);

      console.log('\nOperation Performance:');
      Object.keys(results.operationTimes).forEach(op => {
        const times = results.operationTimes[op];
        if (times.length > 0) {
          const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
          console.log(`- ${op}: Count = ${results.operationCounts[op]}, Avg Time = ${avgTime.toFixed(2)}ms`);
        }
      });

      return results;
    } catch (error) {
      console.error('Load test failed:', error);
      throw error;
    } finally {
      await loadTest.pool.end();
    }
  }
}

// Run the load test if executed directly
if (require.main === module) {
  MultiUserLoadTest.run({
    numUsers: 100,
    duration: 60000 // 1 minute
  }).catch(console.error);
}

module.exports = MultiUserLoadTest;
