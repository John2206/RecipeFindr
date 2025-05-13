// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Correct path to db.js
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Reads JWT_SECRET from .env
const SALT_ROUNDS = 12; // Define salt rounds

// Register User
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    const userId = result.insertId;

    // Generate JWT
    const token = jwt.sign({ id: userId, username: username }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      message: 'User registered successfully',
      token: token,
      user: { id: userId, username: username, email: email }
    });

  } catch (err) {
    console.error('❌ Error during registration:', err.message);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Find user
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: '✅ Login successful!',
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error('❌ Error during login:', err.message);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

module.exports = router;
