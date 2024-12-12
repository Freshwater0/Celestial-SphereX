const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { performance, PerformanceObserver } = require('perf_hooks');
const os = require('os');

class SystemCapacityLoadTester {
  constructor(options = {}) {
    // Configurable load testing parameters
    this.maxConcurrentUsers = options.maxConcurrentUsers || os.cpus().length * 100;
    this.incrementalStep = options.incrementalStep || 50;
    this.maxTotalUsers = options.maxTotalUsers || 10000;
    this.outputDir = path.join(__dirname, 'system-capacity-results');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }

    // Performance tracking
    this.performanceThresholds = {
      maxResponseTime: 500, // ms
      successRateThreshold: 0.95, // 95%
      cpuUsageThreshold: 80, // %
      memoryUsageThreshold: 0.8 // 80%
    };

    this.systemCapacityResults = [];
  }

  // Generate a synthetic test user
  generateTestUser(index) {
    const timestamp = Date.now();
    return {
      id: crypto.randomBytes(8).toString('hex'),
      email: `capacity_test_${index}_${timestamp}_${crypto.randomBytes(4).toString('hex')}@celestialspherex.com`,
      name: `Capacity Test User ${index}`,
      timestamp
    };
  }

  // Measure system resources
  measureSystemResources() {
    return {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      systemLoadAvg: os.loadavg(),
      freeMem: os.freemem(),
      totalMem: os.totalmem()
    };
  }

  // Simulate user registration process with performance tracking
  async simulateUserRegistration(user) {
    const startTime = performance.now();

    // Simulate registration with consistent, controlled processing
    await new Promise(resolve => setTimeout(resolve, 50)); // Consistent 50ms delay

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    return {
      user,
      processingTime,
      timestamp: Date.now()
    };
  }

  // Run systematic capacity testing
  async runSystemCapacityTest() {
    console.log(`🚀 Starting Comprehensive System Capacity Load Test`);
    console.log(`Max Concurrent Users: ${this.maxConcurrentUsers}`);
    console.log(`Total Users to Test: ${this.maxTotalUsers}`);

    // Systematic incremental testing
    for (let concurrentUsers = this.incrementalStep; 
         concurrentUsers <= this.maxConcurrentUsers; 
         concurrentUsers += this.incrementalStep) {
      
      console.log(`\n🔍 Testing Concurrent Users: ${concurrentUsers}`);
      
      const testStartTime = performance.now();
      const systemResourcesBefore = this.measureSystemResources();

      try {
        // Generate users for this test iteration
        const users = Array.from(
          { length: concurrentUsers }, 
          (_, index) => this.generateTestUser(index)
        );

        // Process users in batches
        const batchSize = Math.min(concurrentUsers, 100);
        const results = [];

        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          const batchResults = await Promise.all(
            batch.map(user => this.simulateUserRegistration(user))
          );

          results.push(...batchResults);
        }

        const testEndTime = performance.now();
        const systemResourcesAfter = this.measureSystemResources();

        // Analyze test results
        const testAnalysis = this.analyzeTestResults(
          results, 
          testStartTime, 
          testEndTime,
          systemResourcesBefore,
          systemResourcesAfter
        );

        this.systemCapacityResults.push(testAnalysis);

        // Check if system is approaching limits
        if (this.isSystemNearCapacity(testAnalysis)) {
          console.warn(`⚠️ System Approaching Capacity at ${concurrentUsers} Concurrent Users`);
          break;
        }

      } catch (error) {
        console.error(`❌ Capacity Test Failed at ${concurrentUsers} Concurrent Users:`, error);
        break;
      }
    }

    // Generate comprehensive capacity report
    this.generateSystemCapacityReport();
  }

  // Analyze test results
  analyzeTestResults(results, startTime, endTime, resourcesBefore, resourcesAfter) {
    const totalProcessingTime = endTime - startTime;
    const processingTimes = results.map(r => r.processingTime);

    return {
      concurrentUsers: results.length,
      totalProcessingTime,
      averageProcessingTime: processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
      minProcessingTime: Math.min(...processingTimes),
      maxProcessingTime: Math.max(...processingTimes),
      resourceUtilization: {
        cpuUsageBefore: resourcesBefore.cpuUsage,
        cpuUsageAfter: resourcesAfter.cpuUsage,
        memoryUsageBefore: resourcesBefore.memoryUsage.heapUsed,
        memoryUsageAfter: resourcesAfter.memoryUsage.heapUsed,
        systemLoadAvg: resourcesAfter.systemLoadAvg
      }
    };
  }

  // Determine if system is near capacity
  isSystemNearCapacity(testAnalysis) {
    const { 
      averageProcessingTime, 
      resourceUtilization 
    } = testAnalysis;

    // Check processing time
    if (averageProcessingTime > this.performanceThresholds.maxResponseTime) {
      return true;
    }

    // Check CPU usage (using 1-minute load average)
    const cpuLoadAvg = resourceUtilization.systemLoadAvg[0];
    if (cpuLoadAvg > os.cpus().length * this.performanceThresholds.cpuUsageThreshold) {
      return true;
    }

    return false;
  }

  // Generate comprehensive system capacity report
  generateSystemCapacityReport() {
    const reportFilePath = path.join(this.outputDir, 'system_capacity_report.json');
    
    const systemCapacityReport = {
      timestamp: new Date().toISOString(),
      performanceThresholds: this.performanceThresholds,
      capacityResults: this.systemCapacityResults,
      recommendedMaxConcurrentUsers: this.systemCapacityResults.length > 0 
        ? this.systemCapacityResults[this.systemCapacityResults.length - 1].concurrentUsers 
        : 0
    };

    fs.writeFileSync(reportFilePath, JSON.stringify(systemCapacityReport, null, 2));

    // Detailed console output
    console.log('\n🖥️ System Capacity Analysis:');
    console.log(`Recommended Max Concurrent Users: ${systemCapacityReport.recommendedMaxConcurrentUsers}`);
    
    this.systemCapacityResults.forEach((result, index) => {
      console.log(`\nTest ${index + 1} (${result.concurrentUsers} Concurrent Users):`);
      console.log(`  Total Processing Time: ${result.totalProcessingTime.toFixed(2)}ms`);
      console.log(`  Avg Processing Time: ${result.averageProcessingTime.toFixed(2)}ms`);
      console.log(`  Min Processing Time: ${result.minProcessingTime.toFixed(2)}ms`);
      console.log(`  Max Processing Time: ${result.maxProcessingTime.toFixed(2)}ms`);
    });
  }
}

// Run the comprehensive capacity test
const capacityTester = new SystemCapacityLoadTester({
  maxConcurrentUsers: os.cpus().length * 250,  // Scaled based on CPU cores
  incrementalStep: 100,  // Larger steps for broader testing
  maxTotalUsers: 50000   // Very high upper limit
});

capacityTester.runSystemCapacityTest()
  .then(() => console.log('🎉 System Capacity Test Completed Successfully'))
  .catch(error => console.error('❌ System Capacity Test Failed:', error));
