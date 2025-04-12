import { testConnection } from './config/database';

const runTest = async () => {
  console.log('Testing database connection...');
  
  try {
    await testConnection(3); // Try 3 times
    console.log('✅ Database connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
};

// Run the test
console.log('Starting database connection test...');
runTest(); 