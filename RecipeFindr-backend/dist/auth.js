"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auth.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./db")); // Correct path to db.ts
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Reads JWT_SECRET from .env
const SALT_ROUNDS = 12; // Define salt rounds
// Register User
// @ts-ignore - Express router type conflict resolution
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, email, and password are all required' });
    }
    try {
        // Check if username exists
        const [existingUsersByUsername] = await db_1.default.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsersByUsername.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Check if email exists
        const [existingUsersByEmail] = await db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsersByEmail.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Insert user
        const [result] = await db_1.default.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
        const userId = result.insertId;
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: userId, username: username }, JWT_SECRET, { expiresIn: '1d' });
        return res.status(201).json({
            message: 'User registered successfully',
            token: token,
            user: { id: userId, username: username, email: email || '' }
        });
    }
    catch (err) {
        console.error('❌ Error during registration:', err.message);
        return res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
});
// Login User
// @ts-ignore - Express router type conflict resolution
router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    // User can login with either username or email
    const loginIdentifier = username || email;
    if (!loginIdentifier || !password) {
        return res.status(400).json({ message: 'Username/email and password required' });
    }
    try {
        // Find user by username or email
        const [results] = await db_1.default.query('SELECT * FROM users WHERE username = ? OR email = ?', [loginIdentifier, loginIdentifier]);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = results[0];
        // Compare password
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT (include both username and email in token for flexibility)
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({
            message: '✅ Login successful!',
            token: token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    }
    catch (err) {
        console.error('❌ Error during login:', err.message);
        return res.status(500).json({ message: 'Server error during login', error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map