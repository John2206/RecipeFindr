// routes/recipes.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Fetch all recipes
router.get('/', (req, res) => {
  db.query('SELECT * FROM recipes', (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch recipes:', err.message);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
    res.json(results);
  });
});

// Search recipes by ingredient
router.get('/search', (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  db.query('SELECT * FROM recipes WHERE ingredients LIKE ?', [`%${ingredient}%`], (err, results) => {
    if (err) {
      console.error('❌ Failed to search recipes:', err.message);
      return res.status(500).json({ error: 'Failed to search recipes' });
    }
    res.json(results);
  });
});

// Add a new recipe
router.post('/', (req, res) => {
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
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM recipes WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Failed to delete recipe:', err.message);
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
    res.json({ message: '✅ Recipe deleted successfully!' });
  });
});

module.exports = router;
