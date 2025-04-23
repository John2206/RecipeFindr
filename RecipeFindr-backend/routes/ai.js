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
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API Key is not configured.');
      return res.status(500).json({ error: 'AI service is not configured correctly.' });
  }

  try {
    console.log(`✉️ Sending prompt to OpenAI: "${prompt.substring(0, 50)}..."`);
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo', // Use a cost-effective model like gpt-3.5-turbo unless gpt-4 is essential
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200, // Adjust as needed
        temperature: 0.7, // Adjust creativity
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`, // Uses OPENAI_API_KEY
          'Content-Type': 'application/json',
        },
        timeout: 30000 // Add a timeout (30 seconds)
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
        console.error('❌ OpenAI response format unexpected:', response.data);
        return res.status(500).json({ error: 'Received an unexpected response from AI service.' });
    }

    console.log(`🤖 Received AI response: "${aiResponse.substring(0, 100)}..."`);
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('❌ Error with OpenAI API:', error.response ? error.response.data : error.message);
    // Pass the error to the centralized error handler
    next(error);
  }
});

module.exports = router;