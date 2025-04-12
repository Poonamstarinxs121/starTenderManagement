import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  let connection;
  try {
    // Create connection without database selected
    console.log('🔄 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'startender';
    console.log(`📦 Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Use the database
    console.log(`🔄 Switching to database '${dbName}'...`);
    await connection.query(`USE ${dbName}`);

    // Create company table
    console.log('📝 Creating company table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        website VARCHAR(255),
        gst_number VARCHAR(50),
        cin_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_gst (gst_number),
        INDEX idx_cin (cin_number)
      )
    `);

    console.log(`
✅ Database setup completed successfully!
   Database: ${dbName}
   Tables created:
   - company

You can now start the server with:
   npm run dev
`);

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Make sure you have permission to create databases');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 