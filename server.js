require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5002;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 🔗 MySQL Database Connection (Using Pool for Better Stability)
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: process.env.DB_PASSWORD, // Store MySQL password in .env
  database: "recipedb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection error:", err);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release();
  }
});

// --- 🥗 RECIPE ENDPOINTS --- //

// Fetch all recipes from the database
app.get("/recipes", (req, res) => {
  db.query("SELECT * FROM recipes", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch recipes" });
    res.json(results);
  });
});

// Search recipes by ingredient in the database
app.get("/recipes/search", (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) return res.status(400).json({ error: "No ingredient provided" });

  db.query("SELECT * FROM recipes WHERE ingredients LIKE ?", [`%${ingredient}%`], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to search recipes" });
    res.json(results);
  });
});

// Add a new recipe to the database
app.post("/recipes", (req, res) => {
  const { name, ingredients, instructions } = req.body;
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)",
    [name, ingredients, instructions],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add recipe" });
      res.json({ message: "✅ Recipe added successfully!", recipeId: result.insertId });
    }
  );
});

// Delete a recipe from the database
app.delete("/recipes/:id", (req, res) => {
  db.query("DELETE FROM recipes WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete recipe" });
    res.json({ message: "✅ Recipe deleted successfully!" });
  });
});

// --- 🥘 RECIPE ENDPOINT USING THEMEALDB --- //

// Fetch recipes from TheMealDB API based on ingredients
app.get("/recipes/external", async (req, res) => {
  const { ingredient } = req.query;  // Get ingredients from query string

  if (!ingredient) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  try {
    // Make an API request to TheMealDB
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    
    if (response.data.meals) {
      res.json(response.data.meals);
    } else {
      res.status(404).json({ message: 'No recipes found' });
    }
  } catch (error) {
    console.error("❌ Error fetching from TheMealDB:", error.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// --- 🤖 AI-POWERED RECIPE SUGGESTIONS --- //
app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

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

// --- 🔑 USER AUTHENTICATION --- //

// Register User
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: "Error inserting user" });
      res.json({ message: "✅ User registered successfully!" });
    });
  });
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: "User not found" });

    bcrypt.compare(password, results[0].password, (err, match) => {
      if (err || !match) return res.status(401).json({ message: "Incorrect password" });
      res.json({ message: "✅ Login successful!" });
    });
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
