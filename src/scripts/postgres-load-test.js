const { Pool } = require('pg');
const os = require('os');

class PostgreSQLLoadTest {
  constructor(config) {
    this.config = {
      host: 'aws-0-ap-southeast-2.pooler.supabase.com',
      port: 6543,
      user: 'postgres.lrbcdcqhrbqvgqkjgpdw',
      password: 'Whale55##',
      database: 'postgres',
      maxConnections: config.maxConnections || os.cpus().length,
      concurrentQueries: config.concurrentQueries || 10,
      duration: config.duration || 30000, // 30 seconds
      ...config
    };

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      max: this.config.maxConnections,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async runQuery(client) {
    const start = Date.now();
    try {
      // Simplified query to reduce memory usage
      const result = await client.query(`
        SELECT 
          COUNT(*) as total_count, 
          AVG(random()) as random_avg
        FROM generate_series(1, 100)
      `);
      const duration = Date.now() - start;
      return { duration, rows: result.rowCount };
    } catch (error) {
      console.error('Query error:', error);
      return { duration: Date.now() - start, error: true };
    }
  }

  async performLoadTest() {
    console.log('🚀 PostgreSQL Load Test Configuration:');
    console.log(`- Max Connections: ${this.config.maxConnections}`);
    console.log(`- Concurrent Queries: ${this.config.concurrentQueries}`);
    console.log(`- Test Duration: ${this.config.duration}ms`);

    const queryStats = {
      total: 0,
      successful: 0,
      failed: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0
    };

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    const runConcurrentQueries = async () => {
      const client = await this.pool.connect();
      try {
        const queryResult = await this.runQuery(client);
        
        queryStats.total++;
        if (!queryResult.error) {
          queryStats.successful++;
          queryStats.totalDuration += queryResult.duration;
          queryStats.minDuration = Math.min(queryStats.minDuration, queryResult.duration);
          queryStats.maxDuration = Math.max(queryStats.maxDuration, queryResult.duration);
        } else {
          queryStats.failed++;
        }
      } catch (error) {
        queryStats.failed++;
      } finally {
        client.release();
      }
    };

    const runBatch = async () => {
      const batchPromises = [];
      for (let i = 0; i < this.config.concurrentQueries; i++) {
        batchPromises.push(runConcurrentQueries());
      }
      await Promise.allSettled(batchPromises);
    };

    while (Date.now() < endTime) {
      await runBatch();
    }

    const actualDuration = Date.now() - startTime;

    console.log('\n📊 Load Test Results:');
    console.log(`- Total Queries: ${queryStats.total}`);
    console.log(`- Successful Queries: ${queryStats.successful}`);
    console.log(`- Failed Queries: ${queryStats.failed}`);
    console.log(`- Average Query Duration: ${(queryStats.totalDuration / queryStats.successful || 0).toFixed(2)}ms`);
    console.log(`- Min Query Duration: ${queryStats.minDuration}ms`);
    console.log(`- Max Query Duration: ${queryStats.maxDuration}ms`);
    console.log(`- Actual Test Duration: ${actualDuration}ms`);
    console.log(`- Queries per Second: ${(queryStats.total / (actualDuration / 1000)).toFixed(2)}`);

    await this.pool.end();
  }

  static async run(config = {}) {
    const loadTest = new PostgreSQLLoadTest(config);
    await loadTest.performLoadTest();
  }
}

// Run the load test if executed directly
if (require.main === module) {
  PostgreSQLLoadTest.run({
    maxConnections: os.cpus().length,
    concurrentQueries: 10,
    duration: 30000 // 30 seconds
  }).catch(console.error);
}

module.exports = PostgreSQLLoadTest;
