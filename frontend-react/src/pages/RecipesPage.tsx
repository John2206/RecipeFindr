import React, { useState, useContext, useRef, ChangeEvent, FormEvent } from 'react';
import { APIContext } from '../App';
import { Link } from 'react-router-dom';

const cuisineOptions = [
  '', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Mediterranean', 'Japanese', 'Thai', 'French'
];
const dietaryOptions = [
  '', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'Dairy-Free'
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const RecipesPage: React.FC = () => {
  const { baseUrl: contextBaseUrl } = useContext(APIContext);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [time, setTime] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipeResult, setRecipeResult] = useState('');
  const [macrosHtml, setMacrosHtml] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [showFindOther, setShowFindOther] = useState(false);
  const lastRecipeText = useRef('');

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setRecipeResult('');
    setMacrosHtml('');
    setShowFindOther(false);
    const ingredients = ingredientsInput.split(',').map(item => item.trim()).filter(Boolean);
    if (ingredients.length === 0) {
      setError('Please enter at least one ingredient');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/search-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          cuisine,
          dietary,
          time: parseInt(time as any)
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error && data.error.includes('API key authentication failed')) {
          throw new Error('The recipe search service is currently unavailable. The administrator needs to update the OpenAI API key.');
        } else if (data.error && data.error.includes('rate limit')) {
          throw new Error('The recipe service is busy right now. Please try again in a few minutes.');
        } else {
          throw new Error(data.error || `Server error (${response.status}): Please try again later`);
        }
      }
      const data = await response.json();
      lastRecipeText.current = data.recipe;
      setRecipeResult(formatRecipeCard(data.recipe));
      setMacrosHtml(extractMacros(data.recipe));
      setShowFindOther(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while searching for recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindOther = async () => {
    setIsLoading(true);
    setRecipeResult('<div class="loading">🤖 Asking AI to find another recipe...</div>');
    setError('');
    const ingredients = ingredientsInput.split(',').map(item => item.trim()).filter(Boolean);
    try {
      const response = await fetch(`${API_BASE}/ai/search-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          cuisine,
          dietary,
          time: parseInt(time as any),
          prompt: `Find a different recipe using these ingredients: ${ingredients.join(', ')}. Do not repeat the previous recipe.`
        })
      });
      if (!response.ok) throw new Error('Failed to get another recipe');
      const data = await response.json();
      lastRecipeText.current = data.recipe;
      setRecipeResult(formatRecipeCard(data.recipe));
      setMacrosHtml(extractMacros(data.recipe));
    } catch (err: any) {
      setRecipeResult(`<div class='error-message'>${err.message}</div>`);
    } finally {
      setIsLoading(false);
    }
  };

  function formatRecipeCard(recipeText: string) {
    return `<div class='recipe-card modern-recipe'><div class='recipe-header'><h2>Recipe</h2></div><div class='recipe-body'><pre>${recipeText}</pre></div></div>`;
  }

  function extractMacros(text: string) {
    const macrosLine = text.match(/(?:Calories|Energy)[^\d]*(\d+)[^\n]*[\n,;\|]+.*?Protein[^\d]*(\d+)[^\n]*[\n,;\|]+.*?Carbs?[^\d]*(\d+)[^\n]*[\n,;\|]+.*?Fat[^\d]*(\d+)/i);
    if (macrosLine) {
      return `<div class='macros-info'><strong>Nutrition:</strong><ul><li>Calories: ${macrosLine[1]}</li><li>Protein: ${macrosLine[2]}g</li><li>Carbs: ${macrosLine[3]}g</li><li>Fat: ${macrosLine[4]}g</li></ul></div>`;
    } else {
      const cal = text.match(/(?:Calories|Energy)[^\d]*(\d+)/i);
      const protein = text.match(/Protein[^\d]*(\d+)/i);
      const carbs = text.match(/Carbs?[^\d]*(\d+)/i);
      const fat = text.match(/Fat[^\d]*(\d+)/i);
      if (cal || protein || carbs || fat) {
        return `<div class='macros-info'><strong>Nutrition:</strong><ul>
          ${cal ? `<li>Calories: ${cal[1]}</li>` : ''}
          ${protein ? `<li>Protein: ${protein[1]}g</li>` : ''}
          ${carbs ? `<li>Carbs: ${carbs[1]}g</li>` : ''}
          ${fat ? `<li>Fat: ${fat[1]}g</li>` : ''}
        </ul></div>`;
      }
    }
    return '';
  }

  return (
    <main>
      <div className="container">
        <section className="hero recipe-hero">
          <h1>Find Recipes with Your Ingredients</h1>
          <p>Enter the ingredients you have, and we'll find the perfect recipe tailored just for you!</p>
        </section>
        <section className="recipe-finder-container">
          <form id="recipeFinderForm" className="recipe-form" onSubmit={handleFormSubmit}>
            <div className="form-group ingredients-input">
              <label htmlFor="ingredients">Ingredients (comma separated):</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="ingredients"
                  name="ingredients"
                  placeholder="e.g., chicken, onions, garlic"
                  required
                  value={ingredientsInput}
                  onChange={e => setIngredientsInput(e.target.value)}
                />
                <span className="input-icon">🥗</span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cuisine">Cuisine (optional):</label>
                <select id="cuisine" name="cuisine" className="custom-select" value={cuisine} onChange={e => setCuisine(e.target.value)}>
                  <option value="">Any Cuisine</option>
                  {cuisineOptions.slice(1).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dietary">Dietary Preference:</label>
                <select id="dietary" name="dietary" className="custom-select" value={dietary} onChange={e => setDietary(e.target.value)}>
                  <option value="">No Restrictions</option>
                  {dietaryOptions.slice(1).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="time">Max Cook Time (min):</label>
                <div className="time-input">
                  <input
                    type="range"
                    id="timeSlider"
                    min="5"
                    max="120"
                    value={time}
                    onChange={e => setTime(Number(e.target.value))}
                    onInput={e => setTime(Number((e.target as HTMLInputElement).value))}
                  />
                  <div className="time-display">
                    <input
                      type="number"
                      id="time"
                      name="time"
                      min="5"
                      max="120"
                      value={time}
                      onChange={e => setTime(Number(e.target.value))}
                    />
                    <span> minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Finding Recipe...' : 'Find My Perfect Recipe'}
            </button>
          </form>
          {isLoading && (
            <div id="loadingIndicator" className="recipe-loading">
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
              <p>Discovering delicious recipes with your ingredients...</p>
            </div>
          )}
          {error && (
            <div id="errorMessage" className="error-message" style={{ display: 'block' }}>
              {error}
            </div>
          )}
          <div id="recipeResult" className="recipe-result" dangerouslySetInnerHTML={{ __html: recipeResult }} />
          {showFindOther && (
            <button id="findOtherRecipeBtn" className="btn-find-other" onClick={handleFindOther} disabled={isLoading}>
              {isLoading ? 'Finding another recipe...' : 'Find Other Recipe'}
            </button>
          )}
        </section>
      </div>
      {/* Macros Overlay */}
      {macrosHtml && (
        <div id="macrosOverlay" className="macros-overlay" style={{ display: showMacros ? 'flex' : 'none' }} onClick={e => { if ((e.target as HTMLElement).id === 'macrosOverlay') setShowMacros(false); }}>
          <div className="macros-bubble">
            <button id="closeMacrosBtn" className="close-macros-btn" onClick={() => setShowMacros(false)}>&times;</button>
            <h2>Meal Macros</h2>
            <div id="macrosContent" dangerouslySetInnerHTML={{ __html: macrosHtml || 'No macros available.' }} />
          </div>
        </div>
      )}
      {macrosHtml && (
        <button className="btn-macros-under" onClick={() => setShowMacros(true)}>
          Show Macros
        </button>
      )}
    </main>
  );
};

export default RecipesPage;