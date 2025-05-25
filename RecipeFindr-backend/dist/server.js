"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mysql2_1 = __importDefault(require("mysql2"));
const http_1 = __importDefault(require("http"));
const App_1 = __importDefault(require("./App")); // Import the configured app instance
dotenv_1.default.config(); // Load environment variables first
const PORT = process.env.PORT || 5002; // Reads PORT from .env, fallback to 5002
// Database connection pool (using mysql2/promise for async/await)
const db = mysql2_1.default.createPool({
    host: process.env.DB_HOST || '127.0.0.1', // Use env variable or default
    user: process.env.DB_USER || 'root', // Use env variable or default
    password: process.env.DB_PASSWORD, // MUST be set in .env
    database: process.env.DB_NAME || 'recipedb', // Use env variable or default
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Use promise pool from db.ts instead if preferred
// Create HTTP server using the app from App.ts
const server = http_1.default.createServer(App_1.default);
// Function to start the server
const startServer = () => {
    server.listen(PORT, () => {
        console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error; // Re-throw errors not related to listening
        }
        const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
        switch (error.code) {
            case 'EACCES':
                console.error(`❌ ${bind} requires elevated privileges`);
                process.exit(1); // Exit if permission denied
                break;
            case 'EADDRINUSE':
                console.error(`❌ ${bind} is already in use`);
                process.exit(1); // Exit if port is busy
                break;
            default:
                console.error('❌ Server startup error:', error); // Log other errors
                throw error; // Re-throw unexpected errors
        }
    });
};
// Start the server directly
startServer(); // Ensure this is called
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🔌 Shutting down server...');
    server.close(async () => {
        console.log('✅ Server closed.');
        // Close database pool if needed (optional, depends on pool behavior)
        try {
            await db.end();
            console.log('✅ Database pool closed.');
        }
        catch (err) {
            console.error('❌ Error closing database pool:', err.message);
        }
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map