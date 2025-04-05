const tf = require('@tensorflow/tfjs-node');

// Variable to hold the model
let model;

// Load the pre-trained model
async function loadModel() {
    try {
        model = await tf.loadLayersModel('file:///home/gjergj/recipeFindr/server/model.json');
        console.log('✅ Model loaded!');
    } catch (error) {
        console.error('❌ Failed to load model:', error);
    }
}

// Example: Predict using the model
async function predict(inputData) {
    if (!model) {
        console.error('❌ Model not loaded');
        return;
    }

    try {
        // Ensure the inputData is in the correct shape (e.g., [1, 3], [1, 3, 1] for 2D/3D arrays)
        const inputTensor = tf.tensor(inputData); // You may need to reshape this depending on the model

        // Make prediction
        const prediction = model.predict(inputTensor);

        // Optional: log the prediction result
        prediction.print();

        // Get result as array
        const result = prediction.dataSync();
        console.log('Prediction result:', result);

        return result;
    } catch (error) {
        console.error('❌ Error during prediction:', error);
    }
}

// Load model at the start
loadModel().then(() => {
    // Example input (change this based on your model input requirements)
    const sampleInput = [[1.2, 3.4, 5.6]]; // Assuming your model expects a 2D array as input

    // Make prediction
    predict(sampleInput);
});

module.exports = { loadModel, predict }; // Export functions for use in other parts of your app
