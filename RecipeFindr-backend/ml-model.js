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
        throw error; // Re-throw to indicate failure
    }
}

// Convert base64 image to tensor
async function preprocessImage(base64Image) {
    try {
        // Remove base64 prefix if present (data:image/jpeg;base64,)
        const base64Data = base64Image.includes('base64,') 
            ? base64Image.split('base64,')[1] 
            : base64Image;
            
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Decode and preprocess the image using TensorFlow.js
        const imageTensor = tf.node.decodeImage(imageBuffer);
        
        // Resize the image to match model input requirements (e.g., 224x224 for MobileNet)
        const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
        
        // Normalize pixel values to [0,1] and expand dimensions to add batch size
        const normalizedImage = resizedImage.div(255.0).expandDims(0);
        
        // Cleanup the original tensor to prevent memory leak
        imageTensor.dispose();
        
        return normalizedImage;
    } catch (error) {
        console.error('❌ Error preprocessing image:', error);
        throw new Error('Failed to preprocess image');
    }
}

// Predict using the model with base64 image input
async function predict(base64Image) {
    if (!model) {
        console.error('❌ Model not loaded. Cannot predict.');
        throw new Error('Model is not available');
    }

    try {
        // Preprocess the image
        const inputTensor = await preprocessImage(base64Image);
        
        // Make prediction
        const prediction = model.predict(inputTensor);
        
        // Process the prediction result (modify according to your model output)
        // For example, if model outputs class probabilities:
        const probabilities = await prediction.data();
        
        // Get the class labels (these would be your ingredient categories)
        // This is a simplified example - adapt based on your actual model output
        const classLabels = [
            'Apple', 'Banana', 'Carrot', 'Tomato', 'Onion',
            'Garlic', 'Bell Pepper', 'Cucumber', 'Potato', 'Lemon'
        ];
        
        // Get top predictions (ingredients with highest confidence)
        const predictions = Array.from(probabilities)
            .map((prob, i) => ({ ingredient: classLabels[i], confidence: prob }))
            .filter(item => item.confidence > 0.5) // Only keep ingredients with >50% confidence
            .sort((a, b) => b.confidence - a.confidence) // Sort by confidence
            .slice(0, 5); // Take top 5 ingredients
        
        // Extract just the ingredient names
        const detectedIngredients = predictions.map(item => item.ingredient);
        
        // Dispose tensors to free memory
        inputTensor.dispose();
        prediction.dispose();
        
        console.log('🧠 Detected ingredients:', detectedIngredients);
        return detectedIngredients;
    } catch (error) {
        console.error('❌ Error during prediction:', error);
        throw error;
    }
}

// Export functions
module.exports = { loadModel, predict };
