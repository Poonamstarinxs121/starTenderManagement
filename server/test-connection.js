import { testConnection } from './config/database.js';

console.log('Starting database connection test...');

async function runTest() {
  try {
    await testConnection(3);
    console.log('Database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    process.exit(1);
  }
}

runTest(); 