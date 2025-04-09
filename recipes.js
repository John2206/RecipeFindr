// routes/recipes.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Fetch all recipes with pagination
router.get('/', (req, res) => {
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
router.get('/search', (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  const ingredients = ingredient.split(',');
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  // Build dynamic query for multiple ingredients
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