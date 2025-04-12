import { testConnection } from './config/database';
import OEMModel from './models/OEMModel';

async function testAPI() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');

    // Create test OEM data
    const testOEM = {
      vendorId: 'TEST001',
      companyName: 'Test Company',
      contactPerson: 'John Doe',
      phone: '1234567890',
      email: 'john@test.com',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pinCode: '123456',
      status: 'active' as const
    };

    try {
      // Test Create
      console.log('\nTesting OEM creation...');
      const createdOEM = await OEMModel.create(testOEM);
      console.log('✅ Created OEM:', createdOEM);

      // Test Get All
      console.log('\nTesting get all OEMs...');
      const allOEMs = await OEMModel.findAll();
      console.log('✅ Total OEMs found:', allOEMs.length);

      // Test Get By ID
      console.log('\nTesting get OEM by ID...');
      const foundOEM = await OEMModel.findById(createdOEM.id);
      console.log('✅ Found OEM:', foundOEM);

      // Test Update
      console.log('\nTesting OEM update...');
      const updatedOEM = await OEMModel.update(createdOEM.id, {
        companyName: 'Updated Test Company'
      });
      console.log('✅ Updated OEM:', updatedOEM);

      // Test Search
      console.log('\nTesting OEM search...');
      const searchResults = await OEMModel.search('Test');
      console.log('✅ Search results:', searchResults);

      // Test Delete
      console.log('\nTesting OEM deletion...');
      const deleted = await OEMModel.delete(createdOEM.id);
      console.log('✅ OEM deleted:', deleted);

      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ API operation failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the tests
console.log('Starting API tests...');
testAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 