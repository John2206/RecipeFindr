const API_URL = "http://localhost:5000"; // Base backend URL
const API_BASE = `${API_URL}/api`; // API endpoint base
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
        const response = await fetch(`${API_BASE}/recipes/search?ingredient=${ingredients.join(",")}&limit=10&page=${currentPage}`, {
            headers: AuthService.getAuthHeaders() // Add auth headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching recipes: ${response.statusText}`);
        }

        const data = await response.json();
        const recipes = data.recipes;

        const resultsList = document.getElementById("searchResults");
        resultsList.innerHTML = ""; // Clear previous results

        if (!recipes || recipes.length === 0) {
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

        if (data.currentPage < data.totalPages) {
            const loadMoreButton = document.createElement("button");
            loadMoreButton.textContent = "Find Other Recipes Using These Ingredients";
            loadMoreButton.onclick = loadMoreRecipes;
            resultsList.appendChild(loadMoreButton);
        }

    } catch (error) {
        console.error("Error fetching recipes:", error);
        document.getElementById("searchResults").innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

// Function to load more recipes
async function loadMoreRecipes() {
    currentPage++; // Increase the page number
    await searchRecipes(); // Fetch the next set of recipes
}

// Fetch all recipes from local backend
async function fetchRecipes() {
    try {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "<li>Loading...</li>"; // Show loading text

        const response = await fetch(`${API_BASE}/recipes?limit=10&page=${currentPage}`, {
            headers: AuthService.getAuthHeaders() // Add auth headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching recipes: ${response.statusText}`);
        }

        const data = await response.json();
        const recipes = data.recipes;

        recipeList.innerHTML = ""; // Clear loading text

        if (!recipes || recipes.length === 0) {
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

        if (data.currentPage < data.totalPages) {
            const loadMoreButton = document.createElement("button");
            loadMoreButton.textContent = "Load More Recipes";
            loadMoreButton.onclick = loadMoreRecipes;
            recipeList.appendChild(loadMoreButton);
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = `<li>Error fetching recipes: ${error.message}</li>`;
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
        const response = await fetch(`${API_BASE}/recipes`, {
            method: "POST",
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify({ name, ingredients, instructions }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Failed to add recipe: ${response.statusText}`);
        }

        alert(result.message);
        currentPage = 1; // Reset to first page to show the new recipe
        fetchRecipes();

        document.getElementById("recipeName").value = "";
        document.getElementById("recipeIngredients").value = "";
        document.getElementById("recipeInstructions").value = "";
    } catch (error) {
        console.error("Error adding recipe:", error);
        alert(`Error adding recipe: ${error.message}`);
    }
}

// Delete a recipe
async function deleteRecipe(id) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
        const response = await fetch(`${API_BASE}/recipes/${id}`, {
            method: "DELETE",
            headers: AuthService.getAuthHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Failed to delete recipe: ${response.statusText}`);
        }

        alert(result.message);
        fetchRecipes();
    } catch (error) {
        console.error("Error deleting recipe:", error);
        alert(`Error deleting recipe: ${error.message}`);
    }
}

// Ask AI for a recipe suggestion
async function askAI() {
    const prompt = document.getElementById("recipePrompt").value.trim();
    if (!prompt) {
        alert("Enter a question for AI!");
        return;
    }
    const aiResponseElement = document.getElementById("aiResponse");
    aiResponseElement.innerText = "Asking AI...";

    try {
        const response = await fetch(`${API_BASE}/ask-ai`, {
            method: "POST",
            headers: AuthService.getAuthHeaders(),
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Failed to get AI response: ${response.statusText}`);
        }

        aiResponseElement.innerText = data.response || "No response.";
    } catch (error) {
        console.error("Error getting AI response:", error);
        aiResponseElement.innerText = `Error getting AI response: ${error.message}`;
    }
}

// Function to show the capture button after opening the camera
function showCaptureButton() {
    const captureButton = document.getElementById('captureButton');
    captureButton.style.display = 'block';
}

// Function to start the camera and show the capture button
async function startCamera() {
    try {
        const videoElement = document.getElementById('video');
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = videoStream;
        videoElement.style.display = 'block';

        showCaptureButton();
    } catch (error) {
        console.error('Error accessing the camera:', error);
    }
}

// Load recipes on page load
document.addEventListener("DOMContentLoaded", fetchRecipes);

// Camera functionality
const openCameraBtn = document.querySelector('.open-camera-btn');
const captureBtn = document.querySelector('.capture-btn');
const videoContainer = document.querySelector('.video-container');
const videoElement = document.querySelector('video');

openCameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();

        videoContainer.classList.add('camera-active');
        captureBtn.style.display = 'block';
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Could not access the camera. Please check your permissions.');
    }
});
