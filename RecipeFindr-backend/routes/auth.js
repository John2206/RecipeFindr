// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Fixed path to db.js
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Reads JWT_SECRET from .env
const SALT_ROUNDS = 12; // Define salt rounds

// Register User - Modified to work without email column
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // We'll ignore email in the request since the database doesn't have that column
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Check if username exists - removed email check
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user without email
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    const userId = result.insertId;

    // Generate JWT with longer expiration
    const token = jwt.sign({ id: userId, username: username }, JWT_SECRET, { expiresIn: '7d' }); // Changed to 7 days

    res.status(201).json({ // Use 201 Created status
      message: '✅ User registered successfully!',
      token: token,
      user: { id: userId, username: username } // Return basic user info without email
    });

  } catch (err) {
    console.error('❌ Error during registration:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User - Modified to work without email column
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // We'll ignore email in the request since the database doesn't have that column
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Find user by username only
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT with longer expiration
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // Extending token validity to 7 days
    );

    res.json({
      message: '✅ Login successful!',
      token: token,
      user: { id: user.id, username: user.username } // Return user info without email
    });

  } catch (err) {
    console.error('❌ Error during login:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
