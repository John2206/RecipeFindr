// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const recipesRouter = require('./routes/recipes');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/recipes', recipesRouter);
app.use('/auth', authRouter);

app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'Server is alive 🚀' });
  });
  
module.exports = app;
