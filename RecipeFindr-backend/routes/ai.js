const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get the AI Service API key from environment variables
const AI_SERVICE_API_KEY = process.env.OPENAI_API_KEY; // .env still uses OPENAI_API_KEY
const AI_SERVICE_API_URL = 'https://openrouter.ai/api/v1/chat/completions'; // OpenRouter API URL

// Simple rate limiting implementation
const rateLimiter = {
  tokens: 100, // Increased initial tokens
  maxTokens: 100, // Increased maximum tokens
  lastRefill: Date.now(), // Last time tokens were refilled
  refillRate: 20, // Increased refill rate (tokens per minute)
  
  // Check if a request can be made
  canMakeRequest: function(cost = 1) {
    this.refillTokens();
    console.log(`[RateLimiter] Current tokens: ${this.tokens}, Cost: ${cost}`);
    if (this.tokens >= cost) {
      this.tokens -= cost;
      console.log(`[RateLimiter] Request allowed. Tokens remaining: ${this.tokens}`);
      return true;
    }
    console.warn(`[RateLimiter] Request blocked. Not enough tokens. Tokens available: ${this.tokens}, Cost: ${cost}`);
    return false;
  },
  
  // Refill tokens based on elapsed time
  refillTokens: function() {
    const now = Date.now();
    const elapsedMinutes = (now - this.lastRefill) / (1000 * 60);
    if (elapsedMinutes > 0) {
      const tokensToAdd = Math.floor(elapsedMinutes * this.refillRate);
      if (tokensToAdd > 0) {
        this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
        this.lastRefill = now;
      }
    }
  }
};

// Validate API key format before handling requests
const isValidApiKey = (key) => {
  // Check if the key exists and has a valid format (starts with sk- or sk-or-)
  return Boolean(key && typeof key === 'string' && (key.startsWith('sk-') || key.startsWith('sk-or-')));
};

// Recipe search endpoint - completely public
router.post('/search-recipes', async (req, res, next) => {
  console.log(`[API /search-recipes] Received request with body:`, req.body);
  // Check rate limit (recipe search costs 2 tokens as it's more expensive)
  if (!rateLimiter.canMakeRequest(2)) {
    console.warn('[API /search-recipes] Blocked by local rate limiter.');
    return res.status(503).json({ 
      error: 'Recipe service is currently experiencing high demand. Please try again in a few moments.' 
    });
  }

  const { ingredients, dietary, cuisine, time } = req.body;
  
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: 'Please provide at least one ingredient' });
  }

  // Validate AI Service API key before making request
  if (!isValidApiKey(AI_SERVICE_API_KEY)) {
    console.error('❌ AI Service API Key is missing or has invalid format:', AI_SERVICE_API_KEY?.substring(0, 5) + '...');
    // It's crucial to ensure the API key is loaded. If not, this is a server config issue.
    if (!AI_SERVICE_API_KEY) {
      console.error("FATAL: AI_SERVICE_API_KEY (from .env's OPENAI_API_KEY) is not loaded in the environment!");
    }
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
    console.log(`[API /search-recipes] 🔍 Attempting to search AI service for recipes with: "${ingredients.join(', ')}"`);
    console.log(`[API /search-recipes] Using AI Service API Key starting with: ${AI_SERVICE_API_KEY?.substring(0, 8)}...`);
    
    const response = await axios.post(
      AI_SERVICE_API_URL,
      {
        model: 'openai/gpt-4o', // Use a multimodal model for image analysis
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              // If you want to support image analysis, add an image_url object here
              // { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000, // Increased token limit for more detailed recipes
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${AI_SERVICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000 // Increased timeout for more reliable responses
      }
    );

    const recipeResponse = response.data?.choices?.[0]?.message?.content?.trim();

    if (!recipeResponse) {
      console.error('❌ AI Service response format unexpected:', response.data);
      return res.status(500).json({ error: 'Received an unexpected response from recipe service.' });
    }

    console.log(`[API /search-recipes] 🍲 Recipe found! First 50 chars: "${recipeResponse.substring(0, 50)}..."`);
    
    res.json({ 
      recipe: recipeResponse,
      ingredients: ingredients,
      source: 'online' // Indicate this recipe came from online sources
    });

  } catch (error) {
    console.error('❌ [API /search-recipes] Error during recipe search:', error.message);
    
    if (error.response) {
      console.error('[API /search-recipes] AI Service Response Status:', error.response.status);
      console.error('[API /search-recipes] AI Service Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[API /search-recipes] No error.response object from AI Service. Error details:', error);
    }
    
    // Improved error handling with more specific messages
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key authentication failed. Please verify your AI Service API key is valid and has sufficient credits.' 
      });
    } else if (error.response?.status === 429) {
      return res.status(503).json({ 
        error: 'Recipe service has reached its rate limit with the AI provider. Please try again in a few moments.' 
      });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Recipe search timed out. Please try again with fewer ingredients.' 
      });
    } else if (error.response?.status === 500) {
      return res.status(502).json({
        error: 'AI service error. The AI service might be experiencing technical difficulties.'
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
  console.log(`[API /ask-ai] Received request with body:`, req.body);
  // Check rate limit (standard request costs 1 token)
  if (!rateLimiter.canMakeRequest(1)) {
    console.warn('[API /ask-ai] Blocked by local rate limiter.');
    return res.status(503).json({ 
      error: 'AI service is currently experiencing high demand. Please try again in a few moments.' 
    });
  }

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
  
  // Validate AI Service API key before making request
  if (!isValidApiKey(AI_SERVICE_API_KEY)) {
    console.error('❌ [API /ask-ai] AI Service API Key is missing or has invalid format.');
    if (!AI_SERVICE_API_KEY) {
      console.error("FATAL: AI_SERVICE_API_KEY (from .env's OPENAI_API_KEY) is not loaded in the environment for /ask-ai!");
    }
    return res.status(500).json({ 
      error: 'AI service configuration error. Please check server logs and API key format.' 
    });
  }

  // Determine if this is a recipe web search (for higher token allocation)
  const isRecipeWebSearch = finalPrompt.toLowerCase().includes('search the web for recipes') || 
                            finalPrompt.toLowerCase().includes('find recipes on the web');

  try {
    console.log(`[API /ask-ai] ✉️ Attempting to send prompt to AI Service: "${finalPrompt.substring(0, 50)}..."`);
    console.log(`[API /ask-ai] Using AI Service API Key starting with: ${AI_SERVICE_API_KEY?.substring(0, 8)}...`);
    const response = await axios.post(
      AI_SERVICE_API_URL,
      {
        model: 'openai/gpt-4o', // Use a multimodal model for image analysis
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: finalPrompt },
              // If you want to support image analysis, add an image_url object here
              // { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: isRecipeWebSearch ? 800 : 300, // Allow more tokens for web recipe searches
        temperature: isRecipeWebSearch ? 0.8 : 0.7, // Slightly higher creativity for recipes
      },
      {
        headers: {
          Authorization: `Bearer ${AI_SERVICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000 // Increase timeout to 45 seconds for larger responses
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
        console.error('❌ AI Service response format unexpected:', response.data);
        return res.status(500).json({ error: 'Received an unexpected response from AI service.' });
    }

    console.log(`[API /ask-ai] 🤖 Received AI response: "${aiResponse.substring(0, 100)}..."`);
    
    // For compatibility with older frontend code that expects "suggestion" key
    if (ingredients && !prompt) {
      res.json({ suggestion: aiResponse, response: aiResponse });
    } else {
      res.json({ response: aiResponse });
    }

  } catch (error) {
    console.error('❌ [API /ask-ai] Error with AI Service API:', error.message);
    
    if (error.response) {
      console.error('[API /ask-ai] AI Service Response Status:', error.response.status);
      console.error('[API /ask-ai] AI Service Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[API /ask-ai] No error.response object from AI Service. Error details:', error);
    }
    
    // Specific error handling for common API issues
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key authentication failed. Please verify your AI Service API key is valid and has sufficient credits.' 
      });
    } else if (error.response?.status === 429) {
      return res.status(503).json({ 
        error: 'AI service has reached its rate limit with the AI provider. Please try again in a few moments.' 
      });
    }
    
    // Generic error for other issues
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
});

module.exports = router;