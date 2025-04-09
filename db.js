// config/db.js
const mysql = require('mysql2');

// Check for required environment variables
if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD is not set in environment variables');
  process.exit(1);
}

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'recipedb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the database.');
  connection.release();
});

module.exports = db;