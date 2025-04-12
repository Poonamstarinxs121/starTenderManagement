import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import companyRoutes from './routes/companyRoutes.js';

dotenv.config();

const app = express();
let port = parseInt(process.env.PORT || '5001');

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint that includes database status
let isDatabaseConnected = false;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: isDatabaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/companies', async (req, res, next) => {
  if (!isDatabaseConnected) {
    return res.status(503).json({ 
      error: 'Database is not connected',
      message: 'The server is temporarily unable to handle requests due to database connection issues. Please try again later.'
    });
  }
  next();
}, companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  // Handle database-specific errors
  if (err.code === 'DB_CONNECTION_FAILED') {
    return res.status(503).json({
      error: 'Database Connection Error',
      message: 'Unable to connect to database. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Function to try different ports if the default port is in use
async function findAvailablePort(startPort) {
  const maxAttempts = 10;
  let currentPort = startPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(currentPort)
          .once('listening', () => {
            server.close();
            resolve();
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              reject(new Error(`Port ${currentPort} is in use`));
            } else {
              reject(err);
            }
          });
      });
      return currentPort;
    } catch (error) {
      console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
      currentPort++;
    }
  }
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

// Start server
async function startServer() {
  try {
    // Test database connection before starting the server
    await testConnection(3);
    isDatabaseConnected = true;
    
    // Find an available port
    port = await findAvailablePort(port);
    
    app.listen(port, () => {
      console.log(`
🚀 Server is running successfully!
🌐 Server URL: http://localhost:${port}
📝 API Documentation:
   - GET    /health            - Check server and database status
   - GET    /api/companies     - List all companies
   - POST   /api/companies     - Create a new company
   - GET    /api/companies/:id - Get company by ID
   - PUT    /api/companies/:id - Update company
   - DELETE /api/companies/:id - Delete company

💡 Try it out:
   curl http://localhost:${port}/health
      `);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    if (error.code === 'DB_CONNECTION_FAILED') {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check your database credentials in .env file');
      console.log('3. Verify the database exists (run setup-db.js if needed)');
      console.log('4. Confirm MySQL is running on the correct port\n');
    }
    process.exit(1);
  }
}

// Handle unexpected errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    isDatabaseConnected = false;
    console.error('Database connection was lost. The server will continue running but may be unstable.');
  }
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM. Performing graceful shutdown...');
  process.exit(0);
});

startServer(); 