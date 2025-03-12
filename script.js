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

// Function to get all ingredients from the list
function getIngredients() {
    const ingredients = [];
    const listItems = document.querySelectorAll('#ingredientList li');
    listItems.forEach(item => {
        ingredients.push(item.textContent.replace('Delete', '').trim());
    });
    return ingredients;
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

// Function to display a message when no ingredients are entered
function displayNoIngredientsMessage() {
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = '<li>Please add some ingredients to search for recipes.</li>';
}

// Function to handle errors
function displayErrorMessage(error) {
    console.error(error);
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = '<li>Failed to load recipes. Please try again later.</li>';
}

// Function to display the fetched recipes
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
            ${recipe.slug ? `<a href="https://tasty.co/recipe/${recipe.slug}" target="_blank">View Recipe</a>` : '<p>Recipe link not available</p>'}
        `;
        
        // Append the recipe item to the list of recipes
        recipesList.appendChild(recipeItem);
    });
}

// Function to handle 'Enter' key for ingredient input
document.getElementById('ingredientInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default Enter key behavior (form submission)
        addIngredient(); // Add the ingredient
    }
});

// Fetch data functions for categories, areas, and ingredients
function fetchCategories() {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
        .then(response => response.json())
        .then(data => displayCategories(data.categories))
        .catch(error => console.error('Error fetching categories:', error));
}

function fetchAreas() {
    fetch('https://www.themealdb.com/api/json/v1/1/areas.php')
        .then(response => response.json())
        .then(data => displayAreas(data.areas))
        .catch(error => console.error('Error fetching areas:', error));
}

function fetchIngredients() {
    fetch('https://www.themealdb.com/api/json/v1/1/ingredients.php')
        .then(response => response.json())
        .then(data => displayIngredients(data.ingredients))
        .catch(error => console.error('Error fetching ingredients:', error));
}

// Display functions for categories, areas, and ingredients
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

// Call the fetch functions to load data on page load
fetchCategories();
fetchAreas();
fetchIngredients();
