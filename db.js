// config/db.js
const mysql = require('mysql2');

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'recipedb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;

