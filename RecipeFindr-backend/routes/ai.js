const express = require('express');
const axios = require('axios');
const verifyToken = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Reads OPENAI_API_KEY from .env
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Apply authentication middleware
router.use(verifyToken);

// POST route to handle AI requests (e.g., OpenAI API)
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
  
  if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API Key is not configured.');
      return res.status(500).json({ error: 'AI service is not configured correctly.' });
  }

  // Determine if this is a recipe web search (for higher token allocation)
  const isRecipeWebSearch = finalPrompt.toLowerCase().includes('search the web for recipes') || 
                            finalPrompt.toLowerCase().includes('find recipes on the web');

  try {
    console.log(`✉️ Sending prompt to OpenAI: "${finalPrompt.substring(0, 50)}..."`);
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo', // Use a cost-effective model like gpt-3.5-turbo unless gpt-4 is essential
        messages: [{ role: 'user', content: finalPrompt }],
        max_tokens: isRecipeWebSearch ? 800 : 300, // Allow more tokens for web recipe searches
        temperature: isRecipeWebSearch ? 0.8 : 0.7, // Slightly higher creativity for recipes
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`, // Uses OPENAI_API_KEY
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
    console.error('❌ Error with OpenAI API:', error.response ? error.response.data : error.message);
    // Pass the error to the centralized error handler
    next(error);
  }
});

module.exports = router;