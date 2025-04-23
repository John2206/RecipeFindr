// config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', // Make host configurable
  user: process.env.DB_USER || 'root',     // Make user configurable
  password: process.env.DB_PASSWORD,       // Use env variable
  database: process.env.DB_NAME || 'recipedb', // Make database name configurable
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise(); // Use promise-based interface for async/await

// Test connection (optional but recommended)
db.getConnection()
  .then(connection => {
    console.log('✅ Connected to the database.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    // process.exit(1); // Exit if DB connection fails on start
  });


module.exports = db;

