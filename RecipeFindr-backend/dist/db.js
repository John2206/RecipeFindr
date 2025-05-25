"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// config/db.ts
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables
const config = {
    host: process.env.DB_HOST || '127.0.0.1', // Make host configurable
    user: process.env.DB_USER || 'root', // Make user configurable
    password: process.env.DB_PASSWORD || '', // Use env variable
    database: process.env.DB_NAME || 'recipedb', // Make database name configurable
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
const db = mysql2_1.default.createPool(config);
// Test connection and handle errors
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Unable to connect to MySQL. Is the database running?');
        console.error(err.message);
        process.exit(1); // Exit if DB connection fails on start
    }
    else {
        console.log('✅ Connected to MySQL database.');
        if (connection) {
            connection.release();
        }
    }
});
exports.default = db.promise();
//# sourceMappingURL=db.js.map