// app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// Import TypeScript route modules
import recipesRouter from './routes/recipes';
import aiRouter from './routes/ai';
import predictRouter from './routes/predict';
import openrouterRouter from './routes/openrouter';
import authRouter from './auth';

const app = express();

// Error interface
interface CustomError extends Error {
  status?: number;
}

// Middleware
app.use(cors()); // Enable CORS for all origins (consider restricting in production)
app.use(express.json({ limit: '10mb' })); // Increase limit for potential image data in predict
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes

// Basic root route (Define this specific route first)
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to RecipeFindr API' });
});

// Then mount the routers with prefixes or more specific paths
app.use('/api/recipes', recipesRouter); // Prefix API routes
app.use('/api/auth', authRouter);     // Prefix API routes
app.use('/api/ai', aiRouter);         // Changed prefix to /api/ai (handles /api/ai/ask-ai)
app.use('/api/predict', predictRouter); // Changed prefix to /api/predict (handles /api/predict/predict)
app.use('/api/openrouter', openrouterRouter); // Register OpenRouter API endpoints

// Route for serving the frontend index.html
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Error Handling Middleware (Basic)
// Not Found
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'Not Found' });
});

// General Error Handler
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error("❌ Unhandled Error:", err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

export default app;
