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
});

// Test connection and handle errors
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Unable to connect to MySQL. Is the database running?');
    console.error(err.message);
    process.exit(1); // Exit if DB connection fails on start
  } else {
    console.log('✅ Connected to MySQL database.');
    connection.release();
  }
});

module.exports = db.promise();

