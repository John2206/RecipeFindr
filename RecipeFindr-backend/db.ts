// config/db.ts
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // Make host configurable
  user: process.env.DB_USER || 'root',     // Make user configurable
  password: process.env.DB_PASSWORD || '', // Use env variable
  database: process.env.DB_NAME || 'recipedb', // Make database name configurable
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const db = mysql.createPool(config);

// Test connection and handle errors
db.getConnection((err: Error | null, connection?: mysql.PoolConnection) => {
  if (err) {
    console.error('❌ Unable to connect to MySQL. Is the database running?');
    console.error(err.message);
    process.exit(1); // Exit if DB connection fails on start
  } else {
    console.log('✅ Connected to MySQL database.');
    if (connection) {
      connection.release();
    }
  }
});

export default db.promise();
