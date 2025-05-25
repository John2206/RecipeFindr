"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/predict.ts
const express_1 = __importDefault(require("express"));
const mlModel = __importStar(require("../ml-model"));
const router = express_1.default.Router();
// Temporarily comment out authentication middleware for testing
// router.use(verifyToken);
// POST route for machine learning predictions
// @ts-ignore - Express router type issue, but functionality works correctly
router.post('/predict', async (req, res) => {
    // Ensure model is loaded before allowing predictions
    try {
        await mlModel.loadModel(); // Ensure model is loaded (idempotent)
    }
    catch (loadError) {
        console.error('❌ Prediction endpoint unavailable: Model failed to load.', loadError);
        // Log more details for debugging
        if (loadError instanceof Error && loadError.stack) {
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
        if (result.length === 0) {
            // No real ingredients detected
            return res.status(400).json({ error: 'No real ingredients detected. Please try a clearer photo.' });
        }
        console.log('✅ Prediction successful:', result);
        return res.json({ ingredients: result }); // Return as { ingredients: [...] }
    }
    catch (error) {
        console.error('❌ Error during prediction route:', error);
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        // Return a 500 error with a clear message
        return res.status(500).json({ error: 'Prediction failed due to a server error.' });
    }
});
exports.default = router;
//# sourceMappingURL=predict.js.map