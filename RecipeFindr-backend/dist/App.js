"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
// Import TypeScript route modules
const recipes_1 = __importDefault(require("./routes/recipes"));
const ai_1 = __importDefault(require("./routes/ai"));
const predict_1 = __importDefault(require("./routes/predict"));
const openrouter_1 = __importDefault(require("./routes/openrouter"));
const auth_1 = __importDefault(require("./auth"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)()); // Enable CORS for all origins (consider restricting in production)
app.use(express_1.default.json({ limit: '10mb' })); // Increase limit for potential image data in predict
app.use(express_1.default.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// Serve static files from the frontend directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend')));
// Routes
// Basic root route (Define this specific route first)
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to RecipeFindr API' });
});
// Then mount the routers with prefixes or more specific paths
app.use('/api/recipes', recipes_1.default); // Prefix API routes
app.use('/api/auth', auth_1.default); // Prefix API routes
app.use('/api/ai', ai_1.default); // Changed prefix to /api/ai (handles /api/ai/ask-ai)
app.use('/api/predict', predict_1.default); // Changed prefix to /api/predict (handles /api/predict/predict)
app.use('/api/openrouter', openrouter_1.default); // Register OpenRouter API endpoints
// Route for serving the frontend index.html
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../frontend', 'index.html'));
});
// Error Handling Middleware (Basic)
// Not Found
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});
// General Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
exports.default = app;
//# sourceMappingURL=App.js.map