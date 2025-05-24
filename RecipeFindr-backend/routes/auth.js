// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Fixed path to db.js
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Reads JWT_SECRET from .env
const SALT_ROUNDS = 12; // Define salt rounds

// Register User - Now uses email authentication
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // Check if email exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user with email
    const [result] = await db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const userId = result.insertId;

    // Generate JWT with email
    const token = jwt.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '✅ User registered successfully!',
      token: token,
      user: { id: userId, email: email }
    });

  } catch (err) {
    console.error('❌ Error during registration:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User - Now uses email authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // Find user by email
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT with email
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token: token,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error('❌ Error during login:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
