import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

console.log('📊 Database Configuration:', {
  ...config,
  password: config.password ? '****' : '(none)'
});

const pool = mysql.createPool(config);

export async function testConnection(retries = 3) {
  let lastError = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      
      // Test if we can query the database
      await connection.query('SELECT 1');
      connection.release();
      
      console.log('✅ Database connection successful!');
      return true;
    } catch (error) {
      lastError = error;
      let errorMessage = 'Database connection failed: ';
      
      switch (error.code) {
        case 'ECONNREFUSED':
          errorMessage += `MySQL server is not running on ${config.host}:${config.port}`;
          break;
        case 'ER_ACCESS_DENIED_ERROR':
          errorMessage += `Access denied for user '${config.user}'@'${config.host}'`;
          break;
        case 'ER_BAD_DB_ERROR':
          errorMessage += `Database '${config.database}' does not exist`;
          break;
        case 'PROTOCOL_CONNECTION_LOST':
          errorMessage += 'Database connection was closed';
          break;
        case 'ER_CON_COUNT_ERROR':
          errorMessage += 'Database has too many connections';
          break;
        default:
          errorMessage += error.message;
      }
      
      console.error(`❌ Attempt ${i + 1}/${retries}: ${errorMessage}`);
      
      if (i < retries - 1) {
        const delay = (i + 1) * 1000;
        console.log(`⏳ Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  const finalError = new Error(`Failed to connect to database after ${retries} attempts.\n\n` +
    'Troubleshooting steps:\n' +
    '1. Check if MySQL server is running\n' +
    '2. Verify these environment variables in .env file:\n' +
    `   DB_HOST=${config.host}\n` +
    `   DB_USER=${config.user}\n` +
    `   DB_NAME=${config.database}\n` +
    `   DB_PORT=${config.port}\n` +
    '3. Make sure the database exists\n' +
    '4. Check MySQL user permissions\n\n' +
    `Last error: ${lastError?.message}`
  );
  
  finalError.code = 'DB_CONNECTION_FAILED';
  throw finalError;
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was lost. The application might be unstable.');
  }
});

export { pool }; 