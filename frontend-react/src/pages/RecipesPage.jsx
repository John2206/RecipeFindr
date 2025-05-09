import React, { useState, useContext } from 'react';
import { APIContext } from '../App';
import { Link } from 'react-router-dom';

// Use your context base URL if available, otherwise default
const baseUrl = 'http://localhost:5002';

function RecipesPage() {
  const { baseUrl: contextBaseUrl } = useContext(APIContext);
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [aiRecipeResponse, setAiRecipeResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAiResults, setShowAiResults] = useState(false);

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
    setAiRecipeResponse('');
    setShowAiResults(false);
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowAiResults(true);

    try {
      // Construct a comprehensive prompt for OpenAI to search web recipes
      const prompt = `Search the web for recipes that use these ingredients: ${ingredients.join(", ")}. 
      For each recipe, provide:
      1. Recipe title
      2. Ingredients list
      3. Brief cooking instructions
      4. Approximate cooking time
      5. Link to the original recipe if available
      
      Format your response clearly with headers and bullet points. Return 3-5 recipes.`;

      // Call the AI search endpoint
      const response = await fetch(`${contextBaseUrl || baseUrl}/api/ai/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          // ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `AI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAiRecipeResponse(data.response);
    } catch (err) {
      console.error('Error fetching recipes from AI:', err);
      setError('Failed to fetch recipes. Please try again.');
      setAiRecipeResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  // Format the AI response text to HTML
  const formatAiResponse = (text) => {
    if (!text) return '';
    
    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Format recipe titles (lines starting with "#" or "##" or numbered "1.")
      .replace(/^(#+|[0-9]+\.)\s*(.*?)$/gm, '<h3>$2</h3>')
      // Format links - convert markdown links [text](url) to HTML links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      // Format list items
      .replace(/^(\s*[-*])\s+(.*?)$/gm, '<li>$2</li>')
      // Replace newlines with break tags
      .replace(/\n\n/g, '<br>')
      .replace(/\n/g, '<br>');
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
              {isLoading ? 'Searching with AI...' : 'Get Recipes'}
            </button>
            <button className="btn btn-danger delete-all-button" onClick={handleDeleteAllIngredients}>
              Clear All
            </button>
          </div>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      {showAiResults && (
        <section className="results-section">
          <div id="recipeResults">
            <h2>AI Recipe Recommendations</h2>
            <div className="recipes-container">
              {isLoading ? (
                <div className="loading-spinner">Asking AI to find recipes from the web...</div>
              ) : aiRecipeResponse ? (
                <div 
                  className="ai-recipe-response"
                  dangerouslySetInnerHTML={{ __html: formatAiResponse(aiRecipeResponse) }}
                />
              ) : (
                <p className="no-results">No recipes found. Try different ingredients.</p>
              )}
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