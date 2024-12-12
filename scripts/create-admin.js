const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    // Sync database to ensure User model is created
    await sequelize.sync();

    console.log('🚀 Celestial Sphere Admin User Creation');
    console.log('-------------------------------------');

    // Prompt for admin details
    const email = await new Promise((resolve) => {
      rl.question('Enter admin email: ', resolve);
    });

    const password = await new Promise((resolve) => {
      rl.question('Enter admin password: ', resolve);
    });

    // Validate inputs
    if (!email || !password) {
      console.error('❌ Email and password are required!');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      mfaEnabled: false
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Role: Admin`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
}

createAdminUser();
