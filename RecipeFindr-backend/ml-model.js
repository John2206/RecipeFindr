const tf = require('@tensorflow/tfjs-node');
const path = require('path');

// Variable to hold the model
let model;

// Define the path relative to this file
// Assumes model files are in a 'model' subdirectory sibling to this file
const MODEL_PATH = `file://${path.join(__dirname, 'model', 'model.json')}`;

// Load the pre-trained model
async function loadModel() {
    if (model) {
        console.log('ℹ️ Model already loaded.');
        return model;
    }
    try {
        console.log(`⏳ Loading model from: ${MODEL_PATH}`);
        model = await tf.loadLayersModel(MODEL_PATH);
        console.log('✅ Model loaded successfully!');
        return model;
    } catch (error) {
        console.error(`❌ Failed to load model from ${MODEL_PATH}:`, error);
        // Depending on requirements, you might want to throw the error
        // or handle it gracefully (e.g., disable prediction endpoint)
        throw error; // Re-throw to indicate failure
    }
}

// Predict using the model
async function predict(inputData) {
    if (!model) {
        console.error('❌ Model not loaded. Cannot predict.');
        throw new Error('Model is not available');
    }

    try {
        // Ensure the inputData is in the correct shape
        // This might need adjustment based on your specific model's input requirements
        const inputTensor = tf.tensor(inputData); // Example: tf.tensor2d(inputData, [1, inputData.length]);

        // Make prediction
        const prediction = model.predict(inputTensor);

        // Get result as array
        const result = await prediction.data(); // Use await for async data retrieval
        console.log('🧠 Prediction result:', result);

        // Dispose tensors to free memory
        inputTensor.dispose();
        prediction.dispose();

        return result;
    } catch (error) {
        console.error('❌ Error during prediction:', error);
        throw error; // Re-throw the error
    }
}

// Export functions
module.exports = { loadModel, predict };
