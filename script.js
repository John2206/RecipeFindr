function addIngredient() {
    const input = document.getElementById('ingredientInput');
    const list = document.getElementById('ingredientList');
    const ingredient = input.value.trim();
    if (ingredient) {
        const listItem = document.createElement('li');
        listItem.textContent = ingredient;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteIngredient(listItem);
        };

        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
        input.value = '';
    }
}

function deleteIngredient(listItem) {
    listItem.remove();
}

function deleteAllIngredients() {
    const list = document.getElementById('ingredientList');
    list.innerHTML = '';
}
// Function to search for recipes based on ingredients
function searchRecipes() {
    const listItems = document.querySelectorAll('#ingredientList li');
    const ingredients = Array.from(listItems).map(item => item.textContent.replace('Delete', '').trim());

    console.log('Ingredients:', ingredients); // Debug log to check ingredients

    if (ingredients.length === 0) {
        document.getElementById('recipesList').innerHTML = '<li>No ingredients provided yet.</li>';
        return;
    }

    // Join ingredients into a comma-separated string
    const query = ingredients.join(',');
    const url = `${corsProxy}https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=5&apiKey=${apiKey}`;

    console.log('API URL:', url); // Debug log to check the URL

    // Fetch recipes from the Spoonacular API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Recipes Data:', data); // Debug log to check the API response
            displayRecipes(data);
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            document.getElementById('recipesList').innerHTML = '<li>Failed to load recipes. Please try again later.</li>';
        });
}
const apiKey = '301e22fc765b4ffaa81c262f9cd4f68d'; 
// Remove the duplicate declaration of corsProxy

// Function to search for recipes based on ingredients
function searchRecipes() {
    const listItems = document.querySelectorAll('#ingredientList li');
    const ingredients = Array.from(listItems).map(item => item.textContent.replace('Delete', '').trim());

    console.log('Ingredients:', ingredients); // Debug log to check ingredients

    if (ingredients.length === 0) {
        document.getElementById('recipesList').innerHTML = '<li>No ingredients provided yet.</li>';
        return;
    }

    const query = ingredients.join(',');
    const url = `${corsProxy}https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(query)}&number=5&apiKey=${apiKey}`;

    console.log('API URL:', url); // Debug log to check the URL

    // Fetch recipes from the Spoonacular API
    fetch(url)
        .then(response => {
            console.log('Response Status:', response.status);  // Log the response status code
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Recipes Data:', data);  // Log the API response
            displayRecipes(data);
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            document.getElementById('recipesList').innerHTML = '<li>Failed to load recipes. Please try again later.</li>';
        });
}

// Function to display the fetched recipes
function displayRecipes(recipes) {
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = ''; // Clear previous results

    if (recipes.length === 0) {
        recipesList.innerHTML = '<li>No recipes found with the given ingredients.</li>';
        return;
    }

    recipes.forEach(recipe => {
        const recipeItem = document.createElement('li');
        recipeItem.innerHTML = `
            <strong>${recipe.title}</strong><br>
            <img src="${recipe.image}" alt="${recipe.title}" width="100">
            <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">View Recipe</a>
        `;
        recipesList.appendChild(recipeItem);
    });
}


// Remove the duplicate declaration of corsProxy
// Remove the duplicate declaration of url
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
// const apiKey = 'YOUR_NEW_CORS_ANYWHERE_API_KEY'; // Your API key here
const url = `${corsProxy}https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=5&apiKey=${apiKey}`;
