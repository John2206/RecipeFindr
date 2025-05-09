import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APIContext } from '../App';

const baseUrl = 'http://localhost:5002';

function DisplayRecipesPage() {
  const { baseUrl: contextBaseUrl } = useContext(APIContext);
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('id');
  
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!recipeId) {
        setError('No recipe ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/api/recipes/${recipeId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const recipeData = await response.json();
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId, baseUrl]);

  const handlePrintRecipe = () => {
    if (!recipe) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print this recipe');
      return;
    }

    const content = `
      <html>
        <head>
          <title>${recipe.title} - RecipeFindr</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .recipe-image-container { max-width: 500px; margin: 0 auto; }
            .recipe-image-container img { width: 100%; }
            .recipe-info { margin-top: 20px; }
            h1, h2 { color: #333; }
            @media print {
              .recipe-actions { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          <div class="recipe-meta">
            <p>Time: ${recipe.readyInMinutes} minutes</p>
            <p>Servings: ${recipe.servings}</p>
            <p>Difficulty: ${recipe.difficulty}</p>
          </div>
          <div class="recipe-image-container">
            <img src="${recipe.image}" alt="${recipe.title}" />
          </div>
          <div class="recipe-info">
            <h2>Ingredients</h2>
            <ul>
              ${recipe.extendedIngredients?.map(ingredient => 
                `<li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>`
              ).join('') || '<li>No ingredients information available</li>'}
            </ul>
            <h2>Instructions</h2>
            <ol>
              ${recipe.analyzedInstructions?.[0]?.steps?.map(step => 
                `<li>${step.step}</li>`
              ).join('') || '<li>No instructions available</li>'}
            </ol>
            <h2>Nutrition Information</h2>
            <p>Calories: ${recipe.nutrition?.calories || '--'}</p>
            <p>Protein: ${recipe.nutrition?.protein || '--'}</p>
            <p>Carbs: ${recipe.nutrition?.carbs || '--'}</p>
            <p>Fat: ${recipe.nutrition?.fat || '--'}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return <div className="loading">Loading recipe details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!recipe) {
    return <div className="error-message">Recipe not found</div>;
  }

  return (
    <section className="recipe-details">
      <div className="recipe-header">
        <h1 id="recipeTitle">{recipe.title}</h1>
        <div className="recipe-meta">
          <span id="recipeTime">Time: {recipe.readyInMinutes} minutes</span>
          <span id="recipeServings">Servings: {recipe.servings}</span>
          <span id="recipeDifficulty">Difficulty: {recipe.difficulty || 'Medium'}</span>
        </div>
      </div>

      <div className="recipe-content">
        <div className="recipe-image-container">
          <img 
            id="recipeImage" 
            src={recipe.image} 
            alt={recipe.title} 
            onError={(e) => {e.target.src='https://via.placeholder.com/500x300?text=Recipe+Image'}}
          />
        </div>

        <div className="recipe-info">
          <div className="ingredients-section">
            <h2>Ingredients</h2>
            <ul id="ingredientsList">
              {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
                recipe.extendedIngredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))
              ) : (
                <li>No ingredients information available</li>
              )}
            </ul>
          </div>

          <div className="instructions-section">
            <h2>Instructions</h2>
            <ol id="instructionsList">
              {recipe.analyzedInstructions && recipe.analyzedInstructions[0]?.steps ? (
                recipe.analyzedInstructions[0].steps.map((step, index) => (
                  <li key={index}>{step.step}</li>
                ))
              ) : (
                <li>No instructions available</li>
              )}
            </ol>
          </div>

          <div className="nutrition-section">
            <h2>Nutrition Information</h2>
            <div id="nutritionInfo" className="nutrition-info">
              <p>Calories: {recipe.nutrition?.calories || '--'}</p>
              <p>Protein: {recipe.nutrition?.protein || '--'}</p>
              <p>Carbs: {recipe.nutrition?.carbs || '--'}</p>
              <p>Fat: {recipe.nutrition?.fat || '--'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-actions">
        <Link to="/recipes" className="back-btn">Back to Recipes</Link>
        <button onClick={handlePrintRecipe} className="print-btn">Print Recipe</button>
      </div>
    </section>
  );
}

export default DisplayRecipesPage;