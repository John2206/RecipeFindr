const apiKey = '3a3092b906mshb02d0e8fc4f1a3cp191944jsn197fe7739308';
const apiUrl = 'https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&tags=under_30_minutes';

// Function to add an ingredient to the list
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
        deleteButton.onclick = function () {
            deleteIngredient(listItem);
        };
        // Add event listener to the input field for Enter key press
        document.getElementById('ingredientInput').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default Enter key behavior (form submission)
                addIngredient(); // Add the ingredient
            }
        });

        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
        input.value = ''; // Clear input after adding the ingredient
    }
}

// Function to delete an ingredient
function deleteIngredient(listItem) {
    listItem.remove();
}

// Function to delete all ingredients
function deleteAllIngredients() {
    const list = document.getElementById('ingredientList');
    list.innerHTML = '';
}

// Function to search for recipes based on ingredients
function searchRecipes() {
    const ingredients = getIngredients();
    if (ingredients.length === 0) {
        displayNoIngredientsMessage();
        return;
    }

    const query = ingredients.join(',');
    fetch(`${apiUrl}&q=${query}`, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Log the entire data object to inspect its structure
            displayRecipes(data);
        })
        .catch(error => displayErrorMessage(error));
}


const query = ingredients.join(','); // Combine ingredients into a comma-separated string
const url = `${apiBase}filter.php?i=${query}`; // API endpoint to search recipes by ingredients

console.log('API URL:', url); // Debug log to check the URL

// Fetch recipes from TheMealDB API
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => displayRecipes(data))
    .catch(error => {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipesList').innerHTML = '<li>Failed to load recipes. Please try again later.</li>';
    });

// Function to display the fetched recipes
function displayRecipes(data) {
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = '';

    if (!data.results || data.results.length === 0) {
        recipesList.innerHTML = '<li>No recipes found with the given ingredients.</li>';
        return;
    }

    data.results.forEach(recipe => {
        console.log(recipe); // Debugging: Check the entire recipe object

        const recipeItem = document.createElement('li');

        // Check if slug exists, otherwise avoid using undefined in the link
        const recipeLink = recipe.slug
            ? `https://tasty.co/recipe/${recipe.slug}`
            : '#';

        recipeItem.innerHTML = `
            <strong>${recipe.name}</strong><br>
            ${recipe.thumbnail_url ? `<img src="${recipe.thumbnail_url}" alt="${recipe.name}" width="100"><br>` : ''}
            ${recipe.original_video_url ? `<a href="${recipe.original_video_url}" target="_blank">Watch Video</a><br>` : ''}
            <a href="${recipeLink}" target="_blank">
                ${recipe.slug ? 'View Recipe' : 'Recipe Link Not Available'}
            </a>
        `;

        // Add event listener to handle click and prevent navigation to invalid links
        recipeItem.querySelector('a').addEventListener('click', function (event) {
            if (!recipe.slug) {
                event.preventDefault();
                alert('Recipe link is not available.');
            }
        });

        recipesList.appendChild(recipeItem);
    });
}

// Add event listener to the input field for Enter key press
document.getElementById('ingredientInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default Enter key behavior
        addIngredient(); // Add the ingredient
    }
});

// Fetch data functions
function fetchCategories() {
    fetch(categoriesApi)
        .then(response => response.json())
        .then(data => displayCategories(data.meals))
        .catch(error => console.error('Error fetching categories:', error));
}

function fetchAreas() {
    fetch(areasApi)
        .then(response => response.json())
        .then(data => displayAreas(data.meals))
        .catch(error => console.error('Error fetching areas:', error));
}

function fetchIngredients() {
    fetch(ingredientsApi)
        .then(response => response.json())
        .then(data => displayIngredients(data.meals))
        .catch(error => console.error('Error fetching ingredients:', error));
}

// Display functions
function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    categories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.textContent = category.strCategory;
        categoriesList.appendChild(listItem);
    });
}

function displayAreas(areas) {
    const areasList = document.getElementById('areasList');
    areasList.innerHTML = '';
    areas.forEach(area => {
        const listItem = document.createElement('li');
        listItem.textContent = area.strArea;
        areasList.appendChild(listItem);
    });
}

function displayIngredients(ingredients) {
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';
    ingredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = ingredient.strIngredient;
        ingredientsList.appendChild(listItem);
    });
}
// Function to display recipes directly on the website
function displayRecipes(data) {
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = ''; // Clear previous results

    if (!data.results || data.results.length === 0) {
        recipesList.innerHTML = '<li>No recipes found with the given ingredients.</li>';
        return;
    }

    data.results.forEach(recipe => {
        const recipeItem = document.createElement('li');
        recipeItem.classList.add('recipe-item'); // Add a class for styling purposes

        // Display recipe name, image, and ingredients directly on the page
        recipeItem.innerHTML = `
            <h3>${recipe.name}</h3>
            ${recipe.thumbnail_url ? `<img src="${recipe.thumbnail_url}" alt="${recipe.name}" width="200"><br>` : ''}
            <h4>Ingredients:</h4>
            <ul>
                ${recipe.ingredients ? recipe.ingredients.map(ingredient => `<li>${ingredient.name}</li>`).join('') : '<li>No ingredients listed</li>'}
            </ul>
            <h4>Instructions:</h4>
            <p>${recipe.instructions || 'No instructions available.'}</p>
        `;

        // Append the recipe item to the list of recipes
        recipesList.appendChild(recipeItem);
    });
}

const API_URL = "http://localhost:5000";

async function signup() {
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    if (!username || !password) {
        document.getElementById("message").innerText = "⚠️ Username and password required";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        document.getElementById("message").innerText = data.message;
    } catch (error) {
        document.getElementById("message").innerText = error;
    }
}

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        document.getElementById("message").innerText = "⚠️ Username and password required";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        document.getElementById("message").innerText = data.message;
    } catch (error) {
        document.getElementById("message").innerText = error;
    }
}



// Call the fetch functions to load data on page load
fetchCategories();
fetchAreas();
fetchIngredients();
