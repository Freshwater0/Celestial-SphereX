const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class SupabaseRegistrationTester {
  constructor(iterations = 10) {
    // Initialize Supabase client with service role for full control
    this.supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    );

    // Logging setup
    this.logFile = path.join(__dirname, 'comprehensive_registration_test_log.json');
    this.iterations = iterations;
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: iterations,
      successfulTests: 0,
      failedTests: 0,
      tests: []
    };
  }

  // Generate a unique test user
  generateTestUser() {
    const timestamp = Date.now();
    return {
      email: `test_user_${timestamp}@celestialsphere.com`,
      password: crypto.randomBytes(16).toString('hex'),
      metadata: {
        source: 'registration_comprehensive_test',
        testTimestamp: timestamp
      }
    };
  }

  // Perform user registration with service role
  async testRegistration(testUser) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Use admin-level user creation
        const { data, error } = await this.supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,  // Bypass email confirmation
          user_metadata: testUser.metadata
        });

        if (error) {
          // Check for specific error conditions
          if (error.message.includes('email rate limit')) {
            console.warn(`⚠️ Email rate limit hit. Waiting before retry.`);
            await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
            retryCount++;
            continue;
          }
          throw error;
        }

        // Verify registration details
        return {
          success: true,
          userId: data.user.id,
          email: data.user.email,
          password: testUser.password,
          registeredAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`❌ Registration attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
      }
    }

    throw new Error(`Failed to register user after ${maxRetries} attempts`);
  }

  // Attempt login with newly created user
  async testLogin(email, password) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        return {
          success: true,
          userId: data.user.id,
          email: data.user.email,
          loginAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`❌ Login attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, retryCount)));
      }
    }

    throw new Error(`Failed to log in after ${maxRetries} attempts`);
  }

  // Run comprehensive registration and login test
  async runComprehensiveTest() {
    console.log(`🚀 Starting Comprehensive Supabase Registration and Login Test (${this.iterations} iterations)`);
    
    for (let i = 0; i < this.iterations; i++) {
      console.log(`\n🔍 Test Iteration ${i + 1}:`);
      
      try {
        // Generate unique test user
        const testUser = this.generateTestUser();
        
        // Perform registration
        const registrationResult = await this.testRegistration(testUser);
        
        // Attempt login
        const loginResult = await this.testLogin(
          registrationResult.email, 
          registrationResult.password
        );
        
        // Record successful test
        const testOutcome = {
          iteration: i + 1,
          registration: registrationResult,
          login: loginResult
        };
        
        this.testResults.tests.push(testOutcome);
        this.testResults.successfulTests++;
        
        console.log(`✅ Iteration ${i + 1} Passed:`, testOutcome);
        
        // Add delay between tests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        // Record failed test
        const testOutcome = {
          iteration: i + 1,
          error: error.message
        };
        
        this.testResults.tests.push(testOutcome);
        this.testResults.failedTests++;
        
        console.error(`❌ Iteration ${i + 1} Failed:`, error);
      }
    }

    // Save and display final results
    this.saveTestResults();
    this.displayFinalResults();

    return this.testResults;
  }

  // Save test results to log file
  saveTestResults() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.testResults, null, 2));
      console.log(`📝 Comprehensive test results saved to ${this.logFile}`);
    } catch (error) {
      console.error('❌ Failed to save test results:', error);
    }
  }

  // Display final test results
  displayFinalResults() {
    console.log('\n🏁 Comprehensive Test Summary:');
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`Successful Tests: ${this.testResults.successfulTests}`);
    console.log(`Failed Tests: ${this.testResults.failedTests}`);
    console.log(`Success Rate: ${((this.testResults.successfulTests / this.testResults.totalTests) * 100).toFixed(2)}%`);
  }
}

// Execute the comprehensive test
async function runRegistrationTest() {
  const tester = new SupabaseRegistrationTester(10);  // Run 10 iterations
  await tester.runComprehensiveTest();
}

// Run the test
runRegistrationTest();
