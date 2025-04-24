import React, { useState, useContext } from 'react';
import { APIContext } from '../App';
import { Link } from 'react-router-dom';

const baseUrl = 'http://localhost:5000';

function RecipesPage() {
  const { baseUrl: contextBaseUrl } = useContext(APIContext);
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIngredientSubmit = (e) => {
    e.preventDefault();
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleDeleteIngredient = (ingredientToRemove) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const handleDeleteAllIngredients = () => {
    setIngredients([]);
    setRecipes([]);
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Real API call to the backend
      const response = await fetch(`${baseUrl}/api/recipes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const findOtherRecipes = async () => {
    // Similar to searchRecipes but with different criteria
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all recipes from backend as we're not filtering by specific ingredients
      const response = await fetch(`${baseUrl}/api/recipes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error('Error finding other recipes:', err);
      setError('Failed to find other recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="search-section">
        <div className="search-container">
          <div className="input-group">
            <form onSubmit={handleIngredientSubmit}>
              <input
                type="text"
                id="ingredientInput"
                placeholder="Enter an ingredient..."
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
              />
              <button type="submit" className="add-btn">Add</button>
            </form>
          </div>
          
          <div className="ingredient-list">
            <h3>Your Ingredients</h3>
            <ul id="ingredientList">
              {ingredients.length === 0 ? (
                <p>No ingredients added yet.</p>
              ) : (
                ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    {ingredient}
                    <button onClick={() => handleDeleteIngredient(ingredient)}>×</button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="button-group">
            <button onClick={searchRecipes} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get Recipes'}
            </button>
            <button onClick={findOtherRecipes} className="btn btn-secondary" disabled={isLoading}>
              Find Similar Recipes
            </button>
            <button className="btn btn-danger delete-all-button" onClick={handleDeleteAllIngredients}>
              Clear All
            </button>
          </div>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      {recipes.length > 0 && (
        <section className="results-section">
          <div id="recipeResults">
            <h2>Suggested Recipes</h2>
            <div className="recipes-grid" id="recipesList">
              {recipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-image">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      onError={(e) => {e.target.src='https://via.placeholder.com/300x200?text=No+Image'}}
                    />
                  </div>
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <p>Ready in {recipe.readyInMinutes} minutes</p>
                    <div className="recipe-meta">
                      <span>{recipe.difficulty} difficulty</span>
                      {recipe.matchingIngredients && (
                        <span>Matches: {recipe.matchingIngredients}/{recipe.totalIngredients} ingredients</span>
                      )}
                    </div>
                    <Link to={`/display-recipes?id=${recipe.id}`} className="view-recipe-btn">
                      View Recipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="camera-section">
        <div className="camera-button-container">
          <Link to="/camera" className="camera-link">
            <button className="btn camera-btn">
              <span className="camera-icon">📷</span>
              Scan Ingredients
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RecipesPage;