require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require("openai");

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD is not set in environment variables');
  process.exit(1);
}

// Log API key presence (partial key for security)
console.log('OpenAI API Key configured:', process.env.OPENAI_API_KEY ? 
  `${process.env.OPENAI_API_KEY.substring(0, 5)}...` : 'Not set');

// Initialize Express
const app = express();
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
});

// Test OpenAI connection at startup
async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "Hello, is the API working?" }],
      max_tokens: 10,
    });
    console.log('✅ OpenAI API connection test successful');
  } catch(error) {
    console.error('❌ OpenAI API connection test failed:', error.message);
    // Don't exit process, just log the error
  }
}
testOpenAI();

// ========== Security Middleware ==========
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000'] })); // Limit CORS to specific domain in production
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
}));

// ========== General Middleware ==========
app.use(bodyParser.json());

// ========== MySQL Database ==========
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'recipedb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the database.');
  connection.release();
});

// ========== ML Model ==========
let model;
async function loadModel() {
  try {
    model = await tf.loadLayersModel('file:///home/gjergj/recipeFindr/server/model.json');
    console.log('✅ Model loaded!');
  } catch (error) {
    console.error('❌ Failed to load model:', error);
  }
}
loadModel();

// ========== Routes ==========

// Healthcheck endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'Server is alive 🚀' });
});

// Test OpenAI connection endpoint
app.get('/test-openai', async (req, res) => {
  console.log("Test OpenAI route hit");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, is this working?" }],
      max_tokens: 10,
    });
    
    res.json({ 
      status: 'success', 
      message: 'OpenAI API connection successful',
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'OpenAI API connection failed',
      error: error.message
    });
  }
});



// OpenAI Chat - using proper OpenAI client with improved error handling
app.post('/ask-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  console.log("Received AI request with prompt:", prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful chef assistant. Suggest recipes using available ingredients.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("OpenAI response received successfully");
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('❌ Error with OpenAI API:', error);
    
    if (error.response) {
      console.error('OpenAI API error status:', error.response.status);
      console.error('OpenAI API error data:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'OpenAI API error',
        details: error.response.data 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch AI response', 
      message: error.message || 'Unknown error occurred'
    });
  }
});

// ML Prediction
app.post('/predict', async (req, res) => {
  if (!model) return res.status(500).json({ error: 'Model not loaded yet' });

  const { inputData } = req.body;
  if (!inputData || !Array.isArray(inputData)) {
    return res.status(400).json({ error: 'Input data is required and must be an array' });
  }

  try {
    const inputTensor = tf.tensor(inputData);
    const prediction = model.predict(inputTensor);
    const result = prediction.dataSync();

    console.log('Prediction result:', result);
    res.json({ prediction: result });
  } catch (error) {
    console.error('❌ Error during prediction:', error);
    res.status(500).json({ error: 'Failed to make prediction' });
  }
});

// ========== Recipe Routes ==========
// Fetch all recipes with pagination
app.get('/recipes', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  db.query('SELECT * FROM recipes LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch recipes:', err.message);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
    res.json(results);
  });
});

// Search recipes by ingredient with pagination
app.get('/recipes/search', (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  const ingredients = ingredient.split(',');
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM recipes WHERE ';
  const conditions = ingredients.map(() => 'ingredients LIKE ?').join(' OR ');
  const params = ingredients.map(ing => `%${ing.trim()}%`);
  query += conditions + ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('❌ Failed to search recipes:', err.message);
      return res.status(500).json({ error: 'Failed to search recipes' });
    }
    res.json(results);
  });
});

// Add a new recipe
app.post('/recipes', (req, res) => {
  const { name, ingredients, instructions } = req.body;
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)',
    [name, ingredients, instructions],
    (err, result) => {
      if (err) {
        console.error('❌ Failed to add recipe:', err.message);
        return res.status(500).json({ error: 'Failed to add recipe' });
      }
      res.json({ message: '✅ Recipe added successfully!', recipeId: result.insertId });
    }
  );
});

// Delete a recipe
app.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM recipes WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Failed to delete recipe:', err.message);
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
    res.json({ message: '✅ Recipe deleted successfully!' });
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Uncaught error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
