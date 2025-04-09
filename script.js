const API_URL = "http://localhost:5002";  // Update this to match your backend's URL

axios.get(`${API_URL}/health`)
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));

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
    console.log('Ingredients:', ingredients); // Debugging
    if (ingredients.length === 0) {
        alert("Please add some ingredients first!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/recipes/search?ingredient=${ingredients.join(",")}&limit=10&page=${currentPage}`);
        const recipes = await response.json();
        console.log('Recipes:', recipes);  // Debugging

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
        loadMoreButton.textContent = "Find More Recipes With These Ingredients";
        loadMoreButton.onclick = loadMoreRecipesSearch;
        resultsList.appendChild(loadMoreButton);

    } catch (error) {
        console.error("Error fetching recipes:", error);
        document.getElementById("searchResults").innerHTML = "<li>Error searching recipes. Please try again later.</li>";
    }
}

// Function to load more search results
async function loadMoreRecipesSearch() {
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
        loadMoreButton.textContent = "Load More Recipes";
        loadMoreButton.onclick = loadMoreRecipesAll;
        recipeList.appendChild(loadMoreButton);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        document.getElementById("recipeList").innerHTML = "<li>Error loading recipes. Please try again later.</li>";
    }
}

// Function to load more recipes from all recipes list
async function loadMoreRecipesAll() {
    currentPage++; // Increase the page number
    fetchRecipes(); // Fetch the next set of recipes
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
        alert(result.message || "Recipe added successfully!");
        fetchRecipes();

        // Clear input fields after submission
        document.getElementById("recipeName").value = "";
        document.getElementById("recipeIngredients").value = "";
        document.getElementById("recipeInstructions").value = "";
    } catch (error) {
        console.error("Error adding recipe:", error);
        alert("Failed to add recipe. Please try again.");
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
        alert(result.message || "Recipe deleted successfully!");
        fetchRecipes();
    } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Please try again.");
        // Re-enable the button if there was an error
        if (event && event.target) {
            event.target.disabled = false;
        }
    }
}

// Ask AI for a recipe suggestion with improved debugging
async function askAI() {
    const prompt = document.getElementById("recipePrompt").value.trim();
    const responseBox = document.getElementById("aiResponse");

    if (!prompt) {
        alert("Please enter a question for AI!");
        return;
    }

    responseBox.innerText = "Thinking... 🤔";
    console.log("Sending request to AI endpoint with prompt:", prompt);

    try {
        const response = await fetch(`${API_URL}/ask-ai`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });
        
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("Response data:", data);
        
        if (data.error) {
            throw new Error(data.error + (data.details ? ': ' + data.details : ''));
        }

        responseBox.innerText = data.response || "No response received from AI.";
    } catch (error) {
        console.error("Error getting AI response:", error);
        responseBox.innerText = `Error: ${error.message || "Unknown error"}. Please try again later.`;
    }
}

// Function to test OpenAI connection
async function testOpenAIConnection() {
    const responseBox = document.getElementById("aiResponse") || 
                        document.getElementById("searchResults") || 
                        document.getElementById("recipeList");
    
    if (responseBox) {
        responseBox.innerText = "Testing OpenAI connection...";
    } else {
        console.log("Testing OpenAI connection...");
    }
    
    try {
        const response = await fetch(`${API_URL}/test-openai`);
        const data = await response.json();
        
        if (responseBox) {
            if (data.status === 'success') {
                responseBox.innerText = "OpenAI connection successful! You can ask for recipe suggestions.";
            } else {
                responseBox.innerText = "OpenAI connection test failed: " + data.error;
            }
        }
        
        console.log("OpenAI test result:", data);
    } catch (error) {
        console.error("Error testing OpenAI:", error);
        if (responseBox) {
            responseBox.innerText = "Error testing OpenAI connection: " + error.message;
        }
    }
}

// Load recipes on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();
    
    // Add a "Test OpenAI" button to the page for debugging
    const aiSection = document.querySelector(".ai-section") || document.body;
    const testButton = document.createElement("button");
    testButton.textContent = "Test OpenAI Connection";
    testButton.onclick = testOpenAIConnection;
    testButton.style.marginTop = "10px";
    aiSection.appendChild(testButton);
});

// Automatically trigger adding ingredient when Enter is pressed
document.getElementById("ingredientInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addIngredient();
    }
});