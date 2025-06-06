"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/recipes.ts
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const db_1 = __importDefault(require("../db")); // Import TypeScript db module
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware")); // Import TypeScript auth middleware
const router = express_1.default.Router();
// Protect all recipe routes
router.use(authMiddleware_1.default);
// Public route - Search recipes by ingredient (simple LIKE search)
// @ts-ignore - Express router type issue, but functionality works correctly
router.get('/search', async (req, res, next) => {
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
        const [results] = await db_1.default.query('SELECT id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url, created_at FROM recipes WHERE ingredients LIKE ?', [`%${searchIngredient}%`]);
        res.json(results);
    }
    catch (err) {
        console.error('❌ Failed to search recipes:', err.message);
        // Pass the error to the centralized error handler
        next(err);
    }
});
// Protected route - Add a new recipe (associated with logged-in user)
router.post('/', [
    (0, express_validator_1.body)('name').isString().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('ingredients').isString().isLength({ min: 2 }),
    (0, express_validator_1.body)('instructions').isString().isLength({ min: 2 }),
    (0, express_validator_1.body)('prep_time').optional().isNumeric(),
    (0, express_validator_1.body)('cook_time').optional().isNumeric(),
    (0, express_validator_1.body)('servings').optional().isNumeric(),
    (0, express_validator_1.body)('thumbnail_url').optional().isURL()
    // @ts-ignore - Express router type issue, but functionality works correctly
], async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }
    const { name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url } = req.body;
    const userId = req.user?.id; // Get user ID from authenticated request
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        const [result] = await db_1.default.query('INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time, cook_time, servings, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [userId, name, ingredients, instructions, prep_time || null, cook_time || null, servings || null, thumbnail_url || null]);
        res.status(201).json({ message: '✅ Recipe added successfully!', recipeId: result.insertId }); // Use 201 Created
    }
    catch (err) {
        console.error('❌ Failed to add recipe:', err.message);
        // Pass the error to the centralized error handler
        next(err);
    }
});
// Protected route - Delete a recipe (ensure user owns the recipe or is admin)
// @ts-ignore - Express router type issue, but functionality works correctly
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        // Check if recipe exists and belongs to the user
        const [recipes] = await db_1.default.query('SELECT user_id FROM recipes WHERE id = ?', [id]);
        if (recipes.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Basic ownership check - enhance with roles if needed
        if (recipes[0].user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this recipe' });
        }
        // Delete the recipe
        const [result] = await db_1.default.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            // This case might happen in a race condition or if the initial check failed somehow
            return res.status(404).json({ message: 'Recipe not found or not owned by user' });
        }
        res.json({ message: '✅ Recipe deleted successfully!' });
    }
    catch (err) {
        console.error('❌ Failed to delete recipe:', err.message);
        // Pass the error to the centralized error handler
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=recipes.js.map