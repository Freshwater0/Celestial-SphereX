const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class ComprehensiveUserTester {
  constructor(iterations = 30) {
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
    this.logFile = path.join(__dirname, 'comprehensive_user_test_log.json');
    this.iterations = iterations;
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalTests: iterations,
      successfulTests: 0,
      failedTests: 0,
      tests: []
    };

    // Predefined user data for more realistic testing
    this.firstNames = [
      'Aria', 'Zara', 'Kai', 'Luna', 'Ethan', 'Sophia', 'Noah', 'Emma', 
      'Liam', 'Olivia', 'Mason', 'Ava', 'Elijah', 'Isabella', 'James', 
      'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia'
    ];

    this.lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
      'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
    ];
  }

  // Generate a unique, realistic test user
  generateTestUser(iteration) {
    const firstName = this.firstNames[iteration % this.firstNames.length];
    const lastName = this.lastNames[iteration % this.lastNames.length];
    const timestamp = Date.now();

    return {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${timestamp}@celestialsphere.com`,
      password: crypto.randomBytes(16).toString('hex'),
      metadata: {
        firstName,
        lastName,
        source: 'comprehensive_user_test',
        testTimestamp: timestamp,
        testIteration: iteration
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
          metadata: testUser.metadata,
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

  // Test user deletion
  async testUserDeletion(userId) {
    try {
      const { data, error } = await this.supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ User deletion failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Run comprehensive user test
  async runComprehensiveTest() {
    console.log(`🚀 Starting Comprehensive User Test (${this.iterations} users)`);
    
    for (let i = 0; i < this.iterations; i++) {
      console.log(`\n🔍 Test Iteration ${i + 1}:`);
      
      try {
        // Generate unique test user
        const testUser = this.generateTestUser(i);
        
        // Perform registration
        const registrationResult = await this.testRegistration(testUser);
        
        // Attempt login
        const loginResult = await this.testLogin(
          registrationResult.email, 
          registrationResult.password
        );
        
        // Attempt user deletion
        const deletionResult = await this.testUserDeletion(registrationResult.userId);
        
        // Record successful test
        const testOutcome = {
          iteration: i + 1,
          registration: registrationResult,
          login: loginResult,
          deletion: deletionResult
        };
        
        this.testResults.tests.push(testOutcome);
        this.testResults.successfulTests++;
        
        console.log(`✅ Iteration ${i + 1} Passed:`, testOutcome);
        
        // Add delay between tests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
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
async function runUserTest() {
  const tester = new ComprehensiveUserTester(30);  // Run 30 user tests
  await tester.runComprehensiveTest();
}

// Run the test
runUserTest();
