const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;
const axios = require("axios");
const cors = require("cors");

const PORT = process.env.PORT || 5000; // Default port 5000 or from environment

app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
<<<<<<< HEAD
  host: 'localhost',
  user: 'root', // MySQL username
  password: 'root', // Use environment variable for password
  database: 'recipeDB'
=======
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "recipedb",
>>>>>>> 6defec9153e2006b9f6a55041dc706ee3eaba94b
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Endpoint to get recipes based on ingredients
app.get('/api/recipes', (req, res) => {
  const ingredients = req.query.q ? req.query.q.split(',') : [];

  if (ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' });
  }

  const placeholders = ingredients.map(() => '?').join(',');
  const sql = `SELECT * FROM recipes WHERE ingredients LIKE ${placeholders}`;

  db.query(sql, ingredients.map(ingredient => `%${ingredient}%`), (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch recipes' });
      return;
    }
    res.json(results);
  });
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




// Register User
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: "User already exists" });
        res.json({ message: "✅ User registered successfully!" });
      });
  } catch (error) {
    res.status(500).json({ message: "Error hashing password" });
  }
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    res.json({ message: "✅ Login successful!" });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
