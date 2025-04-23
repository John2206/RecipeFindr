require('dotenv').config(); // Load environment variables first
const express = require('express');
const mysql = require('mysql2');
const tf = require('@tensorflow/tfjs-node'); // Keep if needed for direct TF operations here, otherwise remove
const http = require('http');
const mlModel = require('./ml-model'); // Keep if mlModel functions are called directly here, otherwise remove if only used in routes/predict.js
const appInstance = require('./App'); // Import the configured app instance

// Use the app instance from App.js
const app = appInstance;

const PORT = process.env.PORT || 5000; // Reads PORT from .env

// Database pool setup (can stay here or be solely in db.js)
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', // Use env var or default
  user: process.env.DB_USER || 'root',     // Use env var or default
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'recipedb', // Use env var or default
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise(); // Use promise pool from db.js instead if preferred

// Check database connection (can stay here or be solely in db.js)
db.getConnection()
  .then(connection => {
    console.log('✅ Connected to the database.');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      // Consider exiting if DB is essential for startup
      // process.exit(1);
  });

// Create HTTP server using the app from App.js
const server = http.createServer(app);

// PORT is already defined at the top of the file

// Function to start the server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
      case 'EACCES':
        console.error(`❌ ${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`❌ ${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

// Start the server directly
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connection pool if needed (pool manages connections automatically)
    process.exit(0);
  });
});
