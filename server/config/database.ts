import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const dbConfig: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
};

// Create connection pool
const pool: Pool = mysql.createPool(dbConfig);

// Test the connection
export const testConnection = async (retries = 3): Promise<void> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
      console.log('Database connection test successful');
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Connection attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        // Wait for 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  throw new Error(`Failed to connect to database after ${retries} attempts. Last error: ${lastError?.message}`);
};

// Handle unexpected errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled database promise rejection:', err);
  process.exit(1);
});

export default pool; 