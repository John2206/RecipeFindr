const express = require('express');
const mlModel = require('../ml-model'); // Import the ML model functions
const verifyToken = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);

// POST route for machine learning predictions
router.post('/predict', async (req, res, next) => { // Added next for error handling
  // Ensure model is loaded before allowing predictions
  try {
      await mlModel.loadModel(); // Ensure model is loaded (idempotent)
  } catch (loadError) {
      console.error('❌ Prediction endpoint unavailable: Model failed to load.');
      return res.status(503).json({ error: 'Prediction service is temporarily unavailable.' }); // 503 Service Unavailable
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
    console.log('✅ Prediction successful:', result);
    return res.json({ ingredients: result }); // Return as { ingredients: [...] }
  } catch (error) {
    console.error('❌ Error during prediction route:', error);
    // Pass the error to the centralized error handler in App.js
    next(error); // Forward the error
  }
});

module.exports = router;