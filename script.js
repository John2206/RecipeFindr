const apiBase = 'https://www.themealdb.com/api/json/v1/1/'; // API base URL

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

// Function to search for recipes based on ingredients
function searchRecipes() {
    const listItems = document.querySelectorAll('#ingredientList li');
    const ingredients = Array.from(listItems).map(item => item.textContent.replace('Delete', '').trim());

    console.log('Ingredients:', ingredients); // Debug log to check ingredients

    if (ingredients.length === 0) {
        document.getElementById('recipesList').innerHTML = '<li>No ingredients provided yet.</li>';
        return;
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
}

// Function to display the fetched recipes
function displayRecipes(data) {
    const recipesList = document.getElementById('recipesList');
    recipesList.innerHTML = ''; // Clear previous results

    if (!data.meals || data.meals.length === 0) {
        recipesList.innerHTML = '<li>No recipes found with the given ingredients.</li>';
        return;
    }

    data.meals.forEach(recipe => {
        const recipeItem = document.createElement('li');
        recipeItem.innerHTML = `
            <strong>${recipe.strMeal}</strong><br>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" width="100">
            <a href="${recipe.strSource}" target="_blank">View Recipe</a>
        `;
        recipesList.appendChild(recipeItem);
    });
}

// Function to find other recipes using the ingredients
function findOtherRecipes() {
    const listItems = document.querySelectorAll('#ingredientList li');
    const ingredients = Array.from(listItems).map(item => item.textContent.replace('Delete', '').trim());

    if (ingredients.length === 0) {
        document.getElementById('recipesList').innerHTML = '<li>No ingredients provided yet.</li>';
        return;
    }

    const query = ingredients.join(','); // Combine ingredients into a comma-separated string
    const url = `${apiBase}filter.php?i=${query}`; // API endpoint to search recipes by ingredients

    console.log('Other Recipes API URL:', url); // Debug log to check the URL

    // Fetch other recipes from TheMealDB API based on ingredients
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => displayRecipes(data)) // Display the new recipes
        .catch(error => {
            console.error('Error fetching other recipes:', error);
            document.getElementById('recipesList').innerHTML = '<li>Failed to load recipes. Please try again later.</li>';
        });
}

// Add event listener to the input field for Enter key press
document.getElementById('ingredientInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default Enter key behavior
        addIngredient(); // Add the ingredient
    }
});
