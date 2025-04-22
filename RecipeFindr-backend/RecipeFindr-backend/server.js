require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');

// Initialize Express
const app = express();

// MySQL Database Connection
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'recipedb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the database.');
  connection.release(); // Release the connection back to the pool
});

// Middleware
app.use(bodyParser.json());

// Load the ML model
let model;
async function loadModel() {
  try {
    model = await tf.loadLayersModel('file:///home/gjergj/recipeFindr/server/model.json');
    console.log('✅ Model loaded!');
  } catch (error) {
    console.error('❌ Failed to load model:', error);
  }
}

loadModel(); // Load model when the server starts

// POST route to handle AI requests (e.g., OpenAI API)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
app.post('/ask-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

// POST route for machine learning predictions
app.post('/predict', async (req, res) => {
  if (!model) {
    return res.status(500).json({ error: 'Model not loaded yet' });
  }

  const { inputData } = req.body;

  if (!inputData || !Array.isArray(inputData)) {
    return res.status(400).json({ error: 'Input data is required and must be an array' });
  }

  try {
    // Convert input data to tensor
    const inputTensor = tf.tensor(inputData); // Ensure proper shape based on your model
    const prediction = model.predict(inputTensor);

    // Get the result as a sync array
    const result = prediction.dataSync();
    console.log('Prediction result:', result);

    return res.json({ prediction: result });
  } catch (error) {
    console.error('❌ Error during prediction:', error);
    return res.status(500).json({ error: 'Failed to make prediction' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
