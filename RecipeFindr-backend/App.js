// app.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // Add path module
const recipesRouter = require('./routes/recipes');
const authRouter = require('./routes/auth'); // Move auth.js to routes folder
const aiRouter = require('./routes/ai'); // Assuming AI routes will be moved
const predictRouter = require('./routes/predict'); // Assuming predict routes will be moved

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (consider restricting in production)
app.use(express.json({ limit: '10mb' })); // Increase limit for potential image data in predict
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes

// Basic root route (Define this specific route first)
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to RecipeFindr API' });
});

// Then mount the routers with prefixes or more specific paths
app.use('/api/recipes', recipesRouter); // Prefix API routes
app.use('/api/auth', authRouter);     // Prefix API routes
app.use('/api/ai', aiRouter);         // Changed prefix to /api/ai (handles /api/ai/ask-ai)
app.use('/api/predict', predictRouter); // Changed prefix to /api/predict (handles /api/predict/predict)

// Route for serving the frontend index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Error Handling Middleware (Basic)
// Not Found
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

module.exports = app;
