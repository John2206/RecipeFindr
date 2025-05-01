const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get the OpenAI API key from environment variables with validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Validate API key format before handling requests
const isValidOpenAIKey = (key) => {
  // Check if the key exists and has a valid format (starts with sk-)
  return Boolean(key && typeof key === 'string' && (key.startsWith('sk-') || key.startsWith('sk-proj-')));
};

// Recipe search endpoint - completely public
router.post('/search-recipes', async (req, res, next) => {
  const { ingredients, dietary, cuisine, time } = req.body;
  
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: 'Please provide at least one ingredient' });
  }

  // Validate OpenAI API key before making request
  if (!isValidOpenAIKey(OPENAI_API_KEY)) {
    console.error('❌ OpenAI API Key is missing or has invalid format:', OPENAI_API_KEY?.substring(0, 5) + '...');
    return res.status(500).json({ 
      error: 'Recipe search service configuration error. Please check server logs and API key format.' 
    });
  }

  // Create a more structured prompt for better results that specifically mentions online recipe search
  let prompt = `Search online recipes and find a recipe that uses these ingredients: ${ingredients.join(', ')}`;
  
  // Add optional constraints
  if (dietary) prompt += `\nDietary preferences: ${dietary}`;
  if (cuisine) prompt += `\nCuisine type: ${cuisine}`;
  if (time) prompt += `\nTime constraint: ${time} minutes or less`;
  
  prompt += `\n\nAct as if you're searching popular recipe websites like AllRecipes, Food Network, etc.
Please format the response with the following sections:
1. Recipe Name (as a title)
2. Ingredients (as a list)
3. Instructions (as numbered steps)
4. Prep time and cook time
5. Serving size
6. Brief description of the recipe
`;

  try {
    console.log(`🔍 Searching online for recipes with: "${ingredients.join(', ')}"`);
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000, // Increased token limit for more detailed recipes
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000 // Increased timeout for more reliable responses
      }
    );

    const recipeResponse = response.data?.choices?.[0]?.message?.content?.trim();

    if (!recipeResponse) {
      console.error('❌ OpenAI response format unexpected:', response.data);
      return res.status(500).json({ error: 'Received an unexpected response from recipe service.' });
    }

    console.log(`🍲 Recipe found! First 50 chars: "${recipeResponse.substring(0, 50)}..."`);
    
    res.json({ 
      recipe: recipeResponse,
      ingredients: ingredients,
      source: 'online' // Indicate this recipe came from online sources
    });

  } catch (error) {
    console.error('❌ Error with recipe search:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Improved error handling with more specific messages
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key authentication failed. Please verify your OpenAI API key is valid and has sufficient credits.' 
      });
    } else if (error.response?.status === 429) {
      return res.status(503).json({ 
        error: 'Recipe service has reached its rate limit. Please try again in a few moments.' 
      });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Recipe search timed out. Please try again with fewer ingredients.' 
      });
    } else if (error.response?.status === 500) {
      return res.status(502).json({
        error: 'OpenAI service error. The AI service might be experiencing technical difficulties.'
      });
    }
    
    // Generic error handling
    res.status(500).json({ 
      error: 'Failed to search for recipes. Please try again later or check with support if the issue persists.' 
    });
  }
});

// POST route to handle AI recipe suggestions - Public route
router.post('/ask-ai', async (req, res, next) => {
  // Extract prompt from request body - can be direct prompt or ingredients array
  const { prompt, ingredients } = req.body;
  
  // Generate prompt if only ingredients were provided
  let finalPrompt = prompt;
  if (!finalPrompt && ingredients) {
    finalPrompt = `Suggest a recipe that uses these ingredients: ${ingredients.join(', ')}`;
  }
  
  if (!finalPrompt) {
    return res.status(400).json({ error: 'Prompt or ingredients are required' });
  }
  
  // Validate OpenAI API key before making request
  if (!isValidOpenAIKey(OPENAI_API_KEY)) {
    console.error('❌ OpenAI API Key is missing or has invalid format.');
    return res.status(500).json({ 
      error: 'AI service configuration error. Please check server logs and API key format.' 
    });
  }

  // Determine if this is a recipe web search (for higher token allocation)
  const isRecipeWebSearch = finalPrompt.toLowerCase().includes('search the web for recipes') || 
                            finalPrompt.toLowerCase().includes('find recipes on the web');

  try {
    console.log(`✉️ Sending prompt to OpenAI: "${finalPrompt.substring(0, 50)}..."`);
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: finalPrompt }],
        max_tokens: isRecipeWebSearch ? 800 : 300, // Allow more tokens for web recipe searches
        temperature: isRecipeWebSearch ? 0.8 : 0.7, // Slightly higher creativity for recipes
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000 // Increase timeout to 45 seconds for larger responses
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
        console.error('❌ OpenAI response format unexpected:', response.data);
        return res.status(500).json({ error: 'Received an unexpected response from AI service.' });
    }

    console.log(`🤖 Received AI response: "${aiResponse.substring(0, 100)}..."`);
    
    // For compatibility with older frontend code that expects "suggestion" key
    if (ingredients && !prompt) {
      res.json({ suggestion: aiResponse, response: aiResponse });
    } else {
      res.json({ response: aiResponse });
    }

  } catch (error) {
    console.error('❌ Error with OpenAI API:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Specific error handling for common OpenAI API issues
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key authentication failed. Please verify your OpenAI API key is valid and has sufficient credits.' 
      });
    } else if (error.response?.status === 429) {
      return res.status(503).json({ 
        error: 'AI service has reached its rate limit. Please try again in a few moments.' 
      });
    }
    
    // Generic error for other issues
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

module.exports = router;