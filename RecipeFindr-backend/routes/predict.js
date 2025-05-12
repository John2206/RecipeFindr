const express = require('express');
const mlModel = require('../ml-model'); // Import the ML model functions
const verifyToken = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// Temporarily comment out authentication middleware for testing
// router.use(verifyToken);

// POST route for machine learning predictions
router.post('/predict', async (req, res, next) => { // Added next for error handling
  // Ensure model is loaded before allowing predictions
  try {
      await mlModel.loadModel(); // Ensure model is loaded (idempotent)
  } catch (loadError) {
      console.error('❌ Prediction endpoint unavailable: Model failed to load.', loadError);
      // Log more details for debugging
      if (loadError && loadError.stack) {
        console.error(loadError.stack);
      }
      return res.status(503).json({ error: 'Prediction service is temporarily unavailable. (Model failed to load)' }); // 503 Service Unavailable
  }

  const { image } = req.body; // Expect 'image' from the request body

  // Basic input validation
  if (!image) { // Check if image exists and is a string (base64)
    return res.status(400).json({ error: 'Image data is required' });
  }
  if (typeof image !== 'string') {
     return res.status(400).json({ error: 'Image data must be a base64 string' });
  }
  // Add more specific validation based on your model's expected input format if needed

  try {
    console.log('🧠 Performing prediction with image data...'); // Log image data processing
    const result = await mlModel.predict(image); // Pass the image data to the model
    if (!result || !Array.isArray(result)) {
      // Defensive: If model returns nothing or not an array, return error
      console.error('❌ Model did not return a valid ingredients array:', result);
      return res.status(500).json({ error: 'Prediction failed: Model did not return valid ingredients.' });
    }
    console.log('✅ Prediction successful:', result);
    return res.json({ ingredients: result }); // Return as { ingredients: [...] }
  } catch (error) {
    console.error('❌ Error during prediction route:', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    // Return a 500 error with a clear message
    return res.status(500).json({ error: 'Prediction failed due to a server error.' });
  }
});

module.exports = router;