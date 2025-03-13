require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: process.env.DB_PASSWORD, // Store MySQL password in .env
  database: "MariaDB",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// --- 🥗 RECIPE ENDPOINTS --- //

// Fetch all recipes
app.get("/recipes", (req, res) => {
  db.query("SELECT * FROM recipes", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch recipes" });
    res.json(results);
  });
});

// Search recipes by ingredient
app.get("/recipes/search", (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) return res.status(400).json({ error: "No ingredient provided" });

  db.query("SELECT * FROM recipes WHERE ingredients LIKE ?", [`%${ingredient}%`], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to search recipes" });
    res.json(results);
  });
});

// Add a new recipe
app.post("/recipes", (req, res) => {
  const { name, ingredients, instructions } = req.body;
  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query("INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)", 
    [name, ingredients, instructions], 
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add recipe" });
      res.json({ message: "✅ Recipe added successfully!", recipeId: result.insertId });
    }
  );
});

// Delete a recipe
app.delete("/recipes/:id", (req, res) => {
  db.query("DELETE FROM recipes WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete recipe" });
    res.json({ message: "✅ Recipe deleted successfully!" });
  });
});

// --- 🤖 AI-POWERED RECIPE SUGGESTIONS --- //
app.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;
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
    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong with AI!" });
  }
});

// --- 🔑 USER AUTHENTICATION --- //

// Register User
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: "User already exists" });
        res.json({ message: "✅ User registered successfully!" });
      });
  } catch (error) {
    res.status(500).json({ message: "Error hashing password" });
  }
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    res.json({ message: "✅ Login successful!" });
  });
});

// --- 🚀 START SERVER --- //
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

