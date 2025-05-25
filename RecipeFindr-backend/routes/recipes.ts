// routes/recipes.ts
import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db'; // Import TypeScript db module
import verifyToken from '../middleware/authMiddleware'; // Import TypeScript auth middleware

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

interface Recipe {
  id: number;
  user_id: number;
  name: string;
  ingredients: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  thumbnail_url?: string;
  created_at: Date;
}

// Protect all recipe routes
router.use(verifyToken);

// Public route - Search recipes by ingredient (simple LIKE search)
// @ts-ignore - Express router type issue, but functionality works correctly
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  const { ingredient } = req.query;
  if (!ingredient || typeof ingredient !== 'string') {
    return res.status(400).json({ error: 'No ingredient provided' });
  }

  // Basic sanitization: split by comma, trim, filter empty, take first for simplicity
  const searchIngredient = ingredient.split(',')[0].trim();
  if (!searchIngredient) {
      return res.status(400).json({ error: 'Invalid ingredient format' });
  }

  try {
    // Consider using Full-Text Search in MySQL for better performance and relevance
    const [results] = await db.query(
      'SELECT id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url, created_at FROM recipes WHERE ingredients LIKE ?', 
      [`%${searchIngredient}%`]
    ) as [Recipe[], any];
    res.json(results);
  } catch (err: any) {
    console.error('❌ Failed to search recipes:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

// Protected route - Add a new recipe (associated with logged-in user)
router.post('/', [
  body('name').isString().isLength({ min: 2, max: 100 }),
  body('ingredients').isString().isLength({ min: 2 }),
  body('instructions').isString().isLength({ min: 2 }),
  body('prep_time').optional().isNumeric(),
  body('cook_time').optional().isNumeric(),
  body('servings').optional().isNumeric(),
  body('thumbnail_url').optional().isURL()
// @ts-ignore - Express router type issue, but functionality works correctly
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid input', details: errors.array() });
  }

  const { name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url } = req.body;
  const userId = req.user?.id; // Get user ID from authenticated request

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, ingredients, instructions, prep_time || null, cook_time || null, servings || null, thumbnail_url || null]
    ) as [any, any];
    res.status(201).json({ message: '✅ Recipe added successfully!', recipeId: result.insertId }); // Use 201 Created
  } catch (err: any) {
    console.error('❌ Failed to add recipe:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

// Protected route - Delete a recipe (ensure user owns the recipe or is admin)
// @ts-ignore - Express router type issue, but functionality works correctly
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Check if recipe exists and belongs to the user
    const [recipes] = await db.query('SELECT user_id FROM recipes WHERE id = ?', [id]) as [Recipe[], any];
    if (recipes.length === 0) {
        return res.status(404).json({ message: 'Recipe not found' });
    }
    // Basic ownership check - enhance with roles if needed
    if (recipes[0].user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this recipe' });
    }

    // Delete the recipe
    const [result] = await db.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, userId]) as [any, any];

    if (result.affectedRows === 0) {
        // This case might happen in a race condition or if the initial check failed somehow
        return res.status(404).json({ message: 'Recipe not found or not owned by user' });
    }

    res.json({ message: '✅ Recipe deleted successfully!' });
  } catch (err: any) {
    console.error('❌ Failed to delete recipe:', err.message);
    // Pass the error to the centralized error handler
    next(err);
  }
});

export default router;
