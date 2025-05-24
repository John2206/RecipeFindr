import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APIContext } from '../App';

interface Ingredient {
  amount: number;
  unit: string;
  name: string;
}
interface Step {
  step: string;
}
interface Nutrition {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}
interface Recipe {
  title: string;
  readyInMinutes: number;
  servings: number;
  difficulty?: string;
  image: string;
  extendedIngredients?: Ingredient[];
  analyzedInstructions?: { steps: Step[] }[];
  nutrition?: Nutrition;
}

const DisplayRecipesPage: React.FC = () => {
  const { baseUrl: contextBaseUrl } = useContext(APIContext);
  const [searchParams] = useSearchParams();
  const recipeId = searchParams.get('id');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!recipeId) {
        setError('No recipe ID provided');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(`${contextBaseUrl}/api/recipes/${recipeId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recipeData = await response.json();
        setRecipe(recipeData);
      } catch (err) {
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipeDetails();
  }, [recipeId, contextBaseUrl]);

  const handlePrintRecipe = () => {
    if (!recipe) return;
    // ...existing code...
  };

  if (isLoading) return <div className="loading">Loading recipe details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!recipe) return <div className="error-message">Recipe not found</div>;

  return (
    <section className="recipe-details">
      {/* ...existing code... (JSX unchanged) */}
    </section>
  );
};

export default DisplayRecipesPage;