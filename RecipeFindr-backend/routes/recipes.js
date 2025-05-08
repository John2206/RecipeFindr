// routes/recipes.js
const express = require('express');
const db = require('../db'); // Correct path to db.js
const verifyToken = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// Apply authentication middleware only to routes that need it
// NOT applying router.use(verifyToken) to all routes anymore

// Public route - Search recipes by ingredient (simple LIKE search)
router.get('/search', async (req, res, next) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  // Basic sanitization: split by comma, trim, filter empty, take first for simplicity
  const searchIngredient = ingredient.split(',')[0].trim();
  if (!searchIngredient) {
      return res.status(400).json({ error: 'Invalid ingredient format' });
  }

  try {
    // Consider using Full-Text Search in MySQL for better performance and relevance
    const [results] = await db.query('SELECT id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url, created_at FROM recipes WHERE ingredients LIKE ?', [`%${searchIngredient}%`]);
    res.json(results);
  } catch (err) {
    console.error('❌ Failed to search recipes:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

// Protected route - Add a new recipe (associated with logged-in user)
router.post('/', verifyToken, async (req, res, next) => {
  const { name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url } = req.body;
  const userId = req.user.id; // Get user ID from authenticated request

  // Basic Validation
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: 'Missing required fields: name, ingredients, instructions' });
  }
  if (typeof name !== 'string' || typeof ingredients !== 'string' || typeof instructions !== 'string') {
      return res.status(400).json({ error: 'Invalid data types for name, ingredients, or instructions' });
  }
  // TODO: Add more robust validation here using a library like express-validator
  // e.g., check lengths, numeric types, URL format

  try {
    const [result] = await db.query(
      'INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, ingredients, instructions, prep_time || null, cook_time || null, servings || null, thumbnail_url || null]
    );
    res.status(201).json({ message: '✅ Recipe added successfully!', recipeId: result.insertId }); // Use 201 Created
  } catch (err) {
    console.error('❌ Failed to add recipe:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

// Protected route - Delete a recipe (ensure user owns the recipe or is admin)
router.delete('/:id', verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if recipe exists and belongs to the user
    const [recipes] = await db.query('SELECT user_id FROM recipes WHERE id = ?', [id]);
    if (recipes.length === 0) {
        return res.status(404).json({ message: 'Recipe not found' });
    }
    // Basic ownership check - enhance with roles if needed
    if (recipes[0].user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this recipe' });
    }

    // Delete the recipe
    const [result] = await db.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.affectedRows === 0) {
        // This case might happen in a race condition or if the initial check failed somehow
        return res.status(404).json({ message: 'Recipe not found or not owned by user' });
    }

    res.json({ message: '✅ Recipe deleted successfully!' });
  } catch (err) {
    console.error('❌ Failed to delete recipe:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

module.exports = router;
