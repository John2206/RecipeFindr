// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

// Register User
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        console.error('❌ Error inserting user:', err.message);
        return res.status(500).json({ message: 'Error inserting user' });
      }
      res.json({ message: '✅ User registered successfully!' });
    });
  });
});

// Login User
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    bcrypt.compare(password, results[0].password, (err, match) => {
      if (err) {
        console.error('❌ Password comparison error:', err.message);
        return res.status(500).json({ message: 'Error comparing passwords' });
      }
      if (!match) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      else
      res.json({ message: '✅ Login successful!' });
    });
  });
});

module.exports = router;
  