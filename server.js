require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require("openai");

// Initialize Express
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ========== Security Middleware ==========
app.use(helmet());
app.use(cors({ origin: '*' })); // Allow all origins for debugging
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

// OpenAI Chat
app.post('/ask-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful chef assistant. Suggest recipes using available ingredients.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('❌ Error with OpenAI API:', error.message);
    res.status(500).json({ error: 'Failed to fetch AI response' });
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Uncaught error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
