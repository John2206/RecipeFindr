"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/openrouter.ts
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = express_1.default.Router();
// Helper: Upload base64 image to ImgBB and return the public URL
async function uploadToImgBB(base64) {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey)
        throw new Error('IMGBB API key not configured');
    const form = new URLSearchParams();
    form.append('key', apiKey);
    form.append('image', base64);
    const response = await (0, node_fetch_1.default)('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form
    });
    const data = await response.json();
    if (!data.success) {
        console.error('ImgBB upload failed:', data);
        throw new Error('Failed to upload image to ImgBB');
    }
    return data.data.url;
}
// POST /api/openrouter/analyze-image
// @ts-ignore - Express router type issue, but functionality works correctly
router.post('/analyze-image', async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;
        let finalImageUrl = imageUrl;
        if (!finalImageUrl && imageBase64) {
            finalImageUrl = await uploadToImgBB(imageBase64);
        }
        if (!finalImageUrl) {
            return res.status(400).json({ error: 'imageUrl or imageBase64 is required' });
        }
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }
        const requestBody = {
            model: 'openai/gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: "What's in this image?" },
                        { type: 'image_url', image_url: { url: finalImageUrl } }
                    ]
                }
            ]
        };
        const openRouterResponse = await (0, node_fetch_1.default)('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        const result = await openRouterResponse.json();
        res.json(result);
    }
    catch (err) {
        console.error('Error analyzing image:', err);
        const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
//# sourceMappingURL=openrouter.js.map