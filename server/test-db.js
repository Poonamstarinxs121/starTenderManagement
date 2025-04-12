import { testConnection } from './config/database.js';

console.log('🔍 Testing database connection...');

async function runTest() {
  try {
    await testConnection(3);
    console.log('✅ Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Verify the database exists');
    console.log('4. Confirm MySQL is running on port 3306');
    process.exit(1);
  }
}

runTest(); 