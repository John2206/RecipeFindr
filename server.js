const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'recipefindr'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Endpoints

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
