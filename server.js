require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5002;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check environment variables
if (!process.env.DB_PASSWORD || !OPENAI_API_KEY) {
  console.error("❌ Environment variables are missing. Check your .env file.");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection (Using Pool for Better Stability)
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "recipedb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to the database.");
  connection.release(); // Release the connection back to the pool
});

// --- RECIPE ENDPOINTS --- //

// Fetch all recipes
app.get("/recipes", (req, res) => {
  db.query("SELECT * FROM recipes", (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch recipes:", err.message);
      return res.status(500).json({ error: "Failed to fetch recipes" });
    }
    res.json(results);
  });
});

// Search recipes by ingredient
app.get("/recipes/search", (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: "No ingredient provided" });
  }

  db.query("SELECT * FROM recipes WHERE ingredients LIKE ?", [`%${ingredient}%`], (err, results) => {
    if (err) {
      console.error("❌ Failed to search recipes:", err.message);
      return res.status(500).json({ error: "Failed to search recipes" });
    }
    res.json(results);
  });
});

// Add a new recipe
app.post("/recipes", (req, res) => {
  const { name, ingredients, instructions } = req.body;
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)",
    [name, ingredients, instructions],
    (err, result) => {
      if (err) {
        console.error("❌ Failed to add recipe:", err.message);
        return res.status(500).json({ error: "Failed to add recipe" });
      }
      res.json({ message: "✅ Recipe added successfully!", recipeId: result.insertId });
    }
  );
});

// Delete a recipe
app.delete("/recipes/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM recipes WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("❌ Failed to delete recipe:", err.message);
      return res.status(500).json({ error: "Failed to delete recipe" });
    }
    res.json({ message: "✅ Recipe deleted successfully!" });
  });
});

// --- AI-POWERED RECIPE SUGGESTIONS --- //
app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with AI!" });
  }
});

// --- USER AUTHENTICATION --- //

// Register User
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
      if (err) {
        console.error("❌ Error inserting user:", err.message);
        return res.status(500).json({ message: "Error inserting user" });
      }
      res.json({ message: "✅ User registered successfully!" });
    });
  });
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    bcrypt.compare(password, results[0].password, (err, match) => {
      if (err) {
        console.error("❌ Password comparison error:", err.message);
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if (!match) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      res.json({ message: "✅ Login successful!" });
    });
  });
});

// --- GLOBAL ERROR HANDLERS --- //
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

// --- START SERVER --- //
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
