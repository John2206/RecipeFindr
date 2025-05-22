const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');

// Variable to hold the model
let model;

// Define the path relative to this file
const MODEL_PATH = `file://${path.join(__dirname, 'model', 'model.json')}`;

// Load the pre-trained model
async function loadModel() {
    if (model) {
        console.log('ℹ️ Model already loaded.');
        return model;
    }
    
    try {
        // First check if model files exist
        const modelJsonPath = path.join(__dirname, 'model', 'model.json');
        if (!fs.existsSync(modelJsonPath)) {
            throw new Error(`Model file ${modelJsonPath} does not exist`);
        }
        
        console.log(`⏳ Loading model from: ${MODEL_PATH}`);
        // Use loadGraphModel instead of loadLayersModel for TensorFlow SavedModel converted to TFJS
        model = await tf.loadGraphModel(MODEL_PATH);
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
        const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Force 3 channels (RGB)
        
        // Resize the image to match model input requirements (224x224 for MobileNetV2)
        const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
        
        // Normalize pixel values to [-1,1] as expected by MobileNetV2
        const normalizedImage = resizedImage.div(127.5).sub(1);
        
        // Expand dimensions to add batch size
        const batchedImage = normalizedImage.expandDims(0);
        
        // Cleanup the original tensor to prevent memory leak
        imageTensor.dispose();
        resizedImage.dispose();
        normalizedImage.dispose();
        
        return batchedImage;
    } catch (error) {
        console.error('❌ Error preprocessing image:', error);
        throw new Error('Failed to preprocess image');
    }
}

// Load ImageNet class names
let IMAGENET_CLASSES = [];
try {
    const imagenetClassesPath = path.join(__dirname, 'model', 'imagenet_classes.json');
    if (fs.existsSync(imagenetClassesPath)) {
        IMAGENET_CLASSES = require('./model/imagenet_classes.json');
        console.log(`✅ Loaded ${IMAGENET_CLASSES.length} ImageNet classes`);
    } else {
        console.warn('⚠️ ImageNet classes file not found. Using fallback ingredients.');
    }
} catch (error) {
    console.error('❌ Error loading ImageNet classes:', error);
    // Continue without classes, we'll handle this in predict()
}

// Predict using the model with base64 image input
async function predict(base64Image) {
    if (!model) {
        await loadModel(); // Attempt to load the model if it's not loaded yet
    }

    try {
        // Preprocess the image
        const inputTensor = await preprocessImage(base64Image);
        
        // Make prediction
        const prediction = await model.predict(inputTensor);
        
        // Get the probabilities
        const probabilities = await prediction.data();
        
        // Get indices of top 5 predictions
        const indices = Array.from(probabilities)
            .map((p, i) => ({probability: p, index: i}))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5)
            .map(item => item.index);
        
        // Convert to food ingredients (simplified mapping from ImageNet classes)
        const foodMapping = {
            'banana': 'Banana',
            'orange': 'Orange',
            'apple': 'Apple',
            'lemon': 'Lemon',
            'pineapple': 'Pineapple',
            'strawberry': 'Strawberry',
            'pizza': 'Pizza dough',
            'mushroom': 'Mushroom',
            'broccoli': 'Broccoli',
            'bell pepper': 'Bell Pepper',
            'carrot': 'Carrot',
            'cucumber': 'Cucumber',
            'eggplant': 'Eggplant',
            'head cabbage': 'Cabbage',
            'hot pepper': 'Chili Pepper',
            'zucchini': 'Zucchini',
            'spaghetti squash': 'Spaghetti',
            'acorn squash': 'Squash',
            'butternut squash': 'Butternut Squash',
            'artichoke': 'Artichoke',
            'cardoon': 'Cardoon',
            'guacamole': 'Avocado',
            'meat loaf': 'Ground Beef',
            'bagel': 'Bagel',
            'pretzel': 'Pretzel',
            'cheeseburger': 'Ground Beef',
            'hotdog': 'Hot Dog',
            'mashed potato': 'Potato',
            'cauliflower': 'Cauliflower',
            'cabbage': 'Cabbage',
            'brussels sprout': 'Brussels Sprout',
            'corn': 'Corn'
        };
        
        // Map ImageNet class names to ingredients where possible
        let detectedIngredients = [];
        
        // Check if we have ImageNet classes loaded
        if (IMAGENET_CLASSES && IMAGENET_CLASSES.length > 0) {
            detectedIngredients = indices
                .map(index => {
                    // Safety check to ensure index is within bounds
                    if (index < 0 || index >= IMAGENET_CLASSES.length) {
                        console.warn(`⚠️ Invalid class index: ${index}`);
                        return "Food item";
                    }
                    
                    // Get class name from imagenet classes (with null check)
                    const className = IMAGENET_CLASSES[index];
                    if (!className) {
                        console.warn(`⚠️ Missing class name for index: ${index}`);
                        return "Food item";
                    }
                    
                    const classNameLower = className.toLowerCase();
                    
                    // Try to find a matching food ingredient
                    for (const [key, value] of Object.entries(foodMapping)) {
                        if (classNameLower.includes(key)) {
                            return value;
                        }
                    }
                    
                    // If no match in our mapping, use generic "Food item"
                    return "Food item";
                })
                .filter((ingredient, index, self) => self.indexOf(ingredient) === index); // Remove duplicates
        } else {
            // If ImageNet classes are not available, use default ingredients based on confidence
            console.log('⚠️ No ImageNet classes available, using fallback ingredients');
            // Get top 3 indices based on confidence
            const topIndices = indices.slice(0, 3);
            
            // Map to some generic ingredients
            const genericIngredients = ['Tomato', 'Onion', 'Garlic', 'Olive Oil', 'Salt', 'Pepper', 
                                      'Chicken', 'Beef', 'Potato', 'Carrot'];
            
            // Use modulo to pick ingredients based on indices
            detectedIngredients = topIndices.map(index => genericIngredients[index % genericIngredients.length]);
        }
        
        // Dispose tensors to free memory
        inputTensor.dispose();
        prediction.dispose();
        
        console.log('🧠 Detected ingredients:', detectedIngredients);
        
        // If we didn't detect any food items, return some generic ingredients
        if (detectedIngredients.length === 0 || detectedIngredients.every(item => item === "Food item")) {
            console.log('⚠️ No food ingredients detected, returning empty array');
            return [];
        }
        return detectedIngredients;
    } catch (error) {
        console.error('❌ Error during prediction:', error);
        // Return empty array in case of error
        return [];
    }
}

// Export functions
module.exports = { loadModel, predict };
