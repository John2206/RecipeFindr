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
        const span = document.createElement("span");
        span.textContent = ingredient;

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.onclick = () => listItem.remove();

        listItem.appendChild(span);
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
    const listItems = document.querySelectorAll("#ingredientList li span");
    return Array.from(listItems).map(item => item.textContent.trim());
}

// Modified to search recipes using AI web search
async function searchRecipes() {
    const ingredients = getIngredients();
    if (ingredients.length === 0) {
        alert("Please add some ingredients first!");
        return;
    }

    // Get the results container - on recipes.html page
    const resultsList = document.getElementById("recipesList");
    if (!resultsList) {
        console.error("Cannot find recipesList element");
        return;
    }

    // Show loading state
    resultsList.innerHTML = '<div class="loading">🤖 Asking AI to find recipes from the web...</div>';

    // Construct a comprehensive prompt for OpenAI to search web recipes
    const prompt = `Search the web for recipes that use these ingredients: ${ingredients.join(", ")}. 
    For each recipe, provide:
    1. Recipe title
    2. Ingredients list
    3. Brief cooking instructions
    4. Approximate cooking time
    5. Link to the original recipe if available
    
    Format your response clearly with headers and bullet points. Return 3-5 recipes.`;

    try {
        // Get headers based on authentication status
        let headers = {
            'Content-Type': 'application/json'
        };
        
        // Try to add auth headers if the user is authenticated
        try {
            if (AuthService.isAuthenticated()) {
                headers = {
                    ...headers,
                    ...AuthService.getAuthHeaders()
                };
            }
        } catch (authError) {
            console.log("User not authenticated, proceeding as guest");
        }

        const response = await fetch(`${API_BASE}/ai/ask-ai`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                // If unauthorized, show login prompt
                if (confirm("You need to be logged in to use the AI recipe search. Would you like to log in now?")) {
                    window.location.href = 'login.html';
                    return;
                } else {
                    resultsList.innerHTML = '<div class="message">Please log in to use the AI recipe search feature.</div>';
                    return;
                }
            }
            throw new Error(errorData.error || `AI request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponseText = data.response;

        // Clear loading/previous results
        resultsList.innerHTML = "";

        if (!aiResponseText) {
            resultsList.innerHTML = '<div class="message">AI could not find any recipes. Try different ingredients.</div>';
            return;
        }

        // Display the AI response with formatting
        const responseContainer = document.createElement("div");
        responseContainer.className = 'ai-recipe-response';
        
        // Basic sanitization and formatting
        const sanitizedHtml = aiResponseText
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Format recipe titles (lines starting with "#" or "##" or numbered "1.")
            .replace(/^(#+|[0-9]+\.)\s*(.*?)$/gm, '<h3>$2</h3>')
            // Format links - convert markdown links [text](url) to HTML links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Format list items
            .replace(/^(\s*[-*])\s+(.*?)$/gm, '<li>$2</li>')
            // Replace newlines with break tags
            .replace(/\n\n/g, '<br>')
            .replace(/\n/g, '<br>');
            
        responseContainer.innerHTML = sanitizedHtml;
        resultsList.appendChild(responseContainer);

        // Hide pagination and similarity buttons if they exist
        const buttonGroup = document.querySelector(".button-group");
        if (buttonGroup) {
            const loadMoreButton = buttonGroup.querySelector('button[onclick="loadMoreRecipes()"]');
            const findSimilarButton = buttonGroup.querySelector('button[onclick="findOtherRecipes()"]');
            if (loadMoreButton) loadMoreButton.style.display = 'none';
            if (findSimilarButton) findSimilarButton.style.display = 'none';
        }

    } catch (error) {
        console.error("Error asking AI for recipes:", error);
        if (typeof displayErrorMessage === 'function') {
            displayErrorMessage(error);
        } else {
            resultsList.innerHTML = `<div class="error-message">Error finding recipes: ${error.message}</div>`;
        }
    }
}

// Function to load more recipes
async function loadMoreRecipes() {
    currentPage++;
    await searchRecipes();
}

// Fetch all recipes from local backend
async function fetchRecipes() {
    try {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "<li>Loading...</li>";

        const response = await fetch(`${API_BASE}/recipes?limit=10&page=${currentPage}`, {
            headers: AuthService.getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching recipes: ${response.statusText}`);
        }

        const data = await response.json();
        const recipes = data.recipes;

        recipeList.innerHTML = "";

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
        currentPage = 1;
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
    const ingredientsList = document.getElementById("ingredientList");
    const ingredients = Array.from(ingredientsList.children).map(li => li.textContent.replace('×', '').trim());

    if (ingredients.length === 0) {
        alert("Please add some ingredients first!");
        return;
    }

    const aiResultsDiv = document.getElementById("aiRecipeSuggestion");
    aiResultsDiv.innerHTML = "<p>🤖 Asking AI for a suggestion...</p>";

    try {
        // Get headers based on authentication status
        let headers = {
            'Content-Type': 'application/json'
        };
        
        // Try to add auth headers if the user is authenticated
        try {
            if (AuthService.isAuthenticated()) {
                headers = {
                    ...headers,
                    ...AuthService.getAuthHeaders()
                };
            }
        } catch (authError) {
            console.log("User not authenticated, proceeding as guest");
        }

        const response = await fetch(`${API_BASE}/ai/ask-ai`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ingredients })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                // If unauthorized, show login prompt
                if (confirm("You need to be logged in to use the AI recipe suggestion. Would you like to log in now?")) {
                    window.location.href = 'login.html';
                    return;
                } else {
                    aiResultsDiv.innerHTML = "<p>Please log in to use the AI recipe suggestion feature.</p>";
                    return;
                }
            }
            throw new Error(errorData.error || `AI request failed: ${response.statusText}`);
        }

        const data = await response.json();
        aiResultsDiv.innerHTML = `
            <h3>AI Recipe Suggestion:</h3>
            <p>${data.suggestion.replace(/\n/g, '<br>')}</p>
        `;
    } catch (error) {
        console.error("Error asking AI:", error);
        aiResultsDiv.innerHTML = `<p class="error-message">Error getting AI suggestion: ${error.message}</p>`;
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
