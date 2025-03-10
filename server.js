const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "recipeDB",
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
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





// Get all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add a user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err, result) => {
    if (err) throw err;
    res.json({ message: "User added", id: result.insertId });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
