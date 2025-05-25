import dotenv from 'dotenv';
import mysql from 'mysql2';
import http from 'http';
import app from './App'; // Import the configured app instance

dotenv.config(); // Load environment variables first

const PORT = process.env.PORT || 5002; // Reads PORT from .env, fallback to 5002

// Database connection pool (using mysql2/promise for async/await)
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', // Use env variable or default
  user: process.env.DB_USER || 'root', // Use env variable or default
  password: process.env.DB_PASSWORD, // MUST be set in .env
  database: process.env.DB_NAME || 'recipedb', // Use env variable or default
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Use promise pool from db.ts instead if preferred

// Create HTTP server using the app from App.ts
const server = http.createServer(app);

// Function to start the server
const startServer = (): void => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error; // Re-throw errors not related to listening
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
      case 'EACCES':
        console.error(`❌ ${bind} requires elevated privileges`);
        process.exit(1); // Exit if permission denied
        break;
      case 'EADDRINUSE':
        console.error(`❌ ${bind} is already in use`);
        process.exit(1); // Exit if port is busy
        break;
      default:
        console.error('❌ Server startup error:', error); // Log other errors
        throw error; // Re-throw unexpected errors
    }
  });
};

// Start the server directly
startServer(); // Ensure this is called

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🔌 Shutting down server...');
  server.close(async () => {
    console.log('✅ Server closed.');
    // Close database pool if needed (optional, depends on pool behavior)
    try {
        await db.end();
        console.log('✅ Database pool closed.');
    } catch (err: any) {
        console.error('❌ Error closing database pool:', err.message);
    }
    process.exit(0);
  });
});
