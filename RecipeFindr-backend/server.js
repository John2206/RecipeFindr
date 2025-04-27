require('dotenv').config(); // Load environment variables first
const mysql = require('mysql2');
const http = require('http');
const appInstance = require('./App'); // Import the configured app instance

// Use the app instance from App.js
const app = appInstance;

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
}).promise(); // Use promise pool from db.js instead if preferred

// Create HTTP server using the app from App.js
const server = http.createServer(app);

// Function to start the server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error; // Re-throw errors not related to listening
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
      case 'EACCES':
        console.error(`❌ ${bind} requires elevated privileges`);
        process.exit(1); // Exit if permission denied
        break; // Added break
      case 'EADDRINUSE':
        console.error(`❌ ${bind} is already in use`);
        process.exit(1); // Exit if port is busy
        break; // Added break
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
  server.close(() => {
    console.log('✅ Server closed.');
    // Close database pool if needed (optional, depends on pool behavior)
    db.end(err => {
        if (err) {
            console.error('❌ Error closing database pool:', err.message);
        } else {
            console.log('✅ Database pool closed.');
        }
        process.exit(0);
    });
  });
});
