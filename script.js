const API_URL = "http://localhost:5000"; // Update to the correct backend URL once it is set up
let currentPage = 1;  // To keep track of which page of results we are on

// Function to add an ingredient to the list
function addIngredient() {
    const input = document.getElementById("ingredientInput");
    const list = document.getElementById("ingredientList");
    const ingredient = input.value.trim();

    if (ingredient) {
        const listItem = document.createElement("li");
        listItem.textContent = ingredient;

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.onclick = () => listItem.remove();

        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
        input.value = "";
    }
}

// Function to delete all ingredients
function deleteAllIngredients() {
    document.getElementById("ingredientList").innerHTML = "";
}

// Function to get all ingredients from the list
function getIngredients() {
    return Array.from(document.querySelectorAll("#ingredientList li"))
        .map(item => item.textContent.replace("❌", "").trim())
        .filter(ingredient => ingredient); // Filter out empty ingredients
}

// Search recipes by ingredient (from local database)
async function searchRecipes() {
    const ingredients = getIngredients();
    if (ingredients.length === 0) {
        alert("Please add some ingredients first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/recipes/search?ingredient=${ingredients.join(",")}&limit=10&page=${currentPage}`);
        const recipes = await response.json();

        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = ""; // Clear previous results

        if (recipes.length === 0) {
            resultsList.innerHTML = "<li>No recipes found with these ingredients.</li>";
            return;
        }

        recipes.forEach(recipe => {
            const recipeItem = document.createElement("li");
            recipeItem.innerHTML = `
                <strong>${recipe.name}</strong><br>
                Ingredients: ${recipe.ingredients}<br>
                Instructions: ${recipe.instructions}<br>
                <hr>
            `;
            resultsList.appendChild(recipeItem);
        });

        // Add button to load more recipes
        const loadMoreButton = document.createElement("button");
        loadMoreButton.textContent = "Find Other Recipes Using These Ingredients";
        loadMoreButton.onclick = loadMoreRecipes;
        resultsList.appendChild(loadMoreButton);

    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

// Function to load more recipes
async function loadMoreRecipes() {
    currentPage++; // Increase the page number
    searchRecipes(); // Fetch the next set of recipes
}

// Fetch all recipes from local backend (limited to 10)
async function fetchRecipes() {
    try {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "<li>Loading...</li>"; // Show loading text

        const response = await fetch(`${API_URL}/recipes?limit=10&page=${currentPage}`);
        const recipes = await response.json();

        recipeList.innerHTML = ""; // Clear loading text

        if (recipes.length === 0) {
            recipeList.innerHTML = "<li>No recipes found.</li>";
            return;
        }

        recipes.forEach(recipe => {
            const recipeItem = document.createElement("li");
            recipeItem.innerHTML = `
                <strong>${recipe.name}</strong><br>
                Ingredients: ${recipe.ingredients}<br>
                Instructions: ${recipe.instructions}<br>
                <button onclick="deleteRecipe(${recipe.id})">❌ Delete</button>
                <hr>
            `;
            recipeList.appendChild(recipeItem);
        });

        // Add button to load more recipes
        const loadMoreButton = document.createElement("button");
        loadMoreButton.textContent = "Find Other Recipes Using These Ingredients";
        loadMoreButton.onclick = loadMoreRecipes;
        recipeList.appendChild(loadMoreButton);
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

// Add a new recipe (to local database)
async function addRecipe() {
    const name = document.getElementById("recipeName").value.trim();
    const ingredients = document.getElementById("recipeIngredients").value.trim();
    const instructions = document.getElementById("recipeInstructions").value.trim();

    if (!name || !ingredients || !instructions) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, ingredients, instructions }),
        });

        const result = await response.json();
        alert(result.message);
        fetchRecipes();

        // Clear input fields after submission
        document.getElementById("recipeName").value = "";
        document.getElementById("recipeIngredients").value = "";
        document.getElementById("recipeInstructions").value = "";
    } catch (error) {
        console.error("Error adding recipe:", error);
    }
}

// Delete a recipe
async function deleteRecipe(id) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
        const button = event.target;
        button.disabled = true; // Disable button to prevent multiple clicks

        const response = await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
        const result = await response.json();
        alert(result.message);
        fetchRecipes();
    } catch (error) {
        console.error("Error deleting recipe:", error);
    }
}

// Ask AI for a recipe suggestion (moved to backend)
async function askAI() {
    const prompt = document.getElementById("recipePrompt").value.trim();
    if (!prompt) {
        alert("Enter a question for AI!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/ask-ai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        document.getElementById("aiResponse").innerText = data.response || "No response.";
    } catch (error) {
        document.getElementById("aiResponse").innerText = `Error getting AI response: ${error.message}`;
    }
}

// Load recipes on page load
document.addEventListener("DOMContentLoaded", fetchRecipes);
