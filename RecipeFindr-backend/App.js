// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // bodyParser is deprecated, express.json/urlencoded are preferred
const recipesRouter = require('./routes/recipes');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai'); // Assuming AI routes will be moved
const predictRouter = require('./routes/predict'); // Assuming predict routes will be moved

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (consider restricting in production)
app.use(express.json({ limit: '10mb' })); // Increase limit for potential image data in predict
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Routes
app.use('/api/recipes', recipesRouter); // Prefix API routes
app.use('/api/auth', authRouter);     // Prefix API routes
app.use('/api', aiRouter);            // Prefix API routes (/api/ask-ai)
app.use('/api', predictRouter);       // Prefix API routes (/api/predict)

// Basic root route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to RecipeFindr API' });
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
