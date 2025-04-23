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

  const { inputData } = req.body;

  // Basic input validation
  if (!inputData) { // Check if inputData exists and is suitable (e.g., array, object)
    return res.status(400).json({ error: 'Input data is required' });
  }
  // Add more specific validation based on your model's expected input format
  // e.g., if it expects an array of numbers:
  // if (!Array.isArray(inputData) || !inputData.every(item => typeof item === 'number')) {
  //    return res.status(400).json({ error: 'Input data must be an array of numbers' });
  // }

  try {
    console.log('🧠 Performing prediction with input:', inputData);
    const result = await mlModel.predict(inputData);
    console.log('✅ Prediction successful:', result);
    return res.json({ prediction: result });
  } catch (error) {
    console.error('❌ Error during prediction route:', error);
    // Pass the error to the centralized error handler in App.js
    next(error); // Forward the error
  }
});

module.exports = router;