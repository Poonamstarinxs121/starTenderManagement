import CompanyModel from './models/CompanyModel.js';
import { testConnection } from './config/database.js';

const testCompany = {
  companyName: "Test Company",
  phoneno: "1234567890",
  email: "test@company.com",
  address: "123 Test Street",
  city: "Test City",
  country: "Test Country",
  pincode: "12345",
  pan: "ABCDE1234F",
  gst: "12ABCDE1234F1Z5"
};

async function testCreateCompany() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    
    console.log('Attempting to create company with data:', JSON.stringify(testCompany, null, 2));
    const result = await CompanyModel.create(testCompany);
    console.log('Company created successfully! ID:', result);
    
    console.log('Fetching created company...');
    const createdCompany = await CompanyModel.findById(result);
    console.log('Created company details:', JSON.stringify(createdCompany, null, 2));
    
  } catch (error) {
    console.error('Error occurred:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

console.log('Starting company creation test...');
testCreateCompany(); 