// routes/auth.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db'; // Correct path to db.ts

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET as string; // Reads JWT_SECRET from .env
const SALT_ROUNDS = 12; // Define salt rounds

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
}

interface AuthRequestBody {
  username: string;
  password: string;
  email?: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  error?: string;
}

// Register User
// @ts-ignore - Express router type conflict resolution
router.post('/register', async (req: Request<{}, AuthResponse, AuthRequestBody>, res: Response<AuthResponse>) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]) as [User[], any];
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    ) as [any, any];

    const userId = result.insertId;

    // Generate JWT
    const token = jwt.sign({ id: userId, username: username }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({ 
      message: 'User registered successfully',
      token: token,
      user: { id: userId, username: username, email: email || '' }
    });

  } catch (err: any) {
    console.error('❌ Error during registration:', err.message);
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Login User
// @ts-ignore - Express router type conflict resolution
router.post('/login', async (req: Request<{}, AuthResponse, AuthRequestBody>, res: Response<AuthResponse>) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    // Find user
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]) as [User[], any];
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

    return res.json({
      message: '✅ Login successful!',
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err: any) {
    console.error('❌ Error during login:', err.message);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

export default router;
