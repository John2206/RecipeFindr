// setup-database.js - Database setup script
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

const setupDatabase = async () => {
  try {
    console.log('🔧 Setting up database...');
    
    // Create database if it doesn't exist
    await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'recipedb'}`);
    console.log('✅ Database created/verified');
    
    // Use the database
    await connection.promise().execute(`USE ${process.env.DB_NAME || 'recipedb'}`);
    console.log('✅ Using database');
    
    // Drop existing users table to recreate with correct structure
    await connection.promise().execute('DROP TABLE IF EXISTS recipes');
    await connection.promise().execute('DROP TABLE IF EXISTS users');
    console.log('✅ Cleaned up existing tables');
    
    // Create users table with all required columns
    const createUsersTable = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await connection.promise().execute(createUsersTable);
    console.log('✅ Users table created');
    
    // Create recipes table
    const createRecipesTable = `
      CREATE TABLE recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        prep_time INT,
        cook_time INT,
        servings INT,
        thumbnail_url VARCHAR(255),
        video_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().execute(createRecipesTable);
    console.log('✅ Recipes table created');
    
    // Verify table structure
    const [usersColumns] = await connection.promise().execute('DESCRIBE users');
    console.log('✅ Users table structure:');
    console.table(usersColumns);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    connection.end();
  }
};

setupDatabase();
