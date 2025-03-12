require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; // Default port 5000 or from environment

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // MySQL username
  password: process.env.MYSQL_PASSWORD, // Use environment variable for password
  database: 'recipeDB'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// AI request route
app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Use environment variable for API key
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// Get all recipes
app.get('/recipes', (req, res) => {
  const query = 'SELECT * FROM recipes';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch recipes' });
    } else {
      res.json(results);
    }
  });
});

// Get recipes by ingredient
app.get('/recipes/search', (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  const query = 'SELECT * FROM recipes WHERE ingredients LIKE ?';
  db.query(query, [`%${ingredient}%`], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to search recipes' });
    } else {
      res.json(results);
    }
  });
});

// Add a new recipe
app.post('/recipes', (req, res) => {
  const { name, ingredients, instructions } = req.body;
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)';
  db.query(query, [name, ingredients, instructions], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Failed to add recipe' });
    } else {
      res.json({ message: 'Recipe added successfully', recipeId: result.insertId });
    }
  });
});

// Delete a recipe
app.delete('/recipes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM recipes WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete recipe' });
    } else {
      res.json({ message: 'Recipe deleted successfully' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
