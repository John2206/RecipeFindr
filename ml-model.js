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
    try {
        if (!model) {
            throw new Error('Model is not loaded. Please load the model before making predictions.');
        }

        // Ensure the inputData is in the correct shape (e.g., [1, 3], [1, 3, 1] for 2D/3D arrays)
        const inputTensor = tf.tensor(inputData);

        // Check if the input shape matches the model's expected input shape
        const modelInputShape = model.inputs[0].shape; // Get the model's input shape
        if (inputTensor.shape.toString() !== modelInputShape.slice(1).toString()) {
            console.warn(`⚠️ Input shape mismatch. Reshaping input to match model's expected shape: ${modelInputShape.slice(1)}`);
            const reshapedTensor = inputTensor.reshape(modelInputShape.slice(1));
            inputTensor.dispose(); // Dispose of the original tensor to free memory
            inputTensor = reshapedTensor;
        }

        // Make prediction
        const prediction = model.predict(inputTensor);

        // Optional: log the prediction result
        prediction.print();

        // Get result as array
        const result = await prediction.data(); // Use `data()` for async tensor access
        console.log('Prediction result:', result);

        // Dispose tensors to free memory
        inputTensor.dispose();
        prediction.dispose();

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
