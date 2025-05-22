import express, { type Request, type Response, Router } from 'express';
// Use native fetch if available, otherwise import node-fetch
import fetch from 'node-fetch';

const router = Router();

interface AnalyzeImageRequestBody {
  imageUrl?: string;
  imageBase64?: string;
}

// Helper: Upload base64 image to a free image host (imgbb)
async function uploadToImgBB(base64: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error('IMGBB API key not configured');
  const form = new URLSearchParams();
  form.append('key', apiKey);
  form.append('image', base64);
  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: form
  });
  const data = await response.json();
  if (!data.success) throw new Error('Failed to upload image to imgbb');
  return data.data.url;
}

// POST /api/openrouter/analyze-image
router.post('/analyze-image', async (req: Request, res: Response) => {
  const { imageUrl, imageBase64 }: AnalyzeImageRequestBody = req.body;
  let finalImageUrl = imageUrl;

  try {
    if (!finalImageUrl && imageBase64) {
      // Upload base64 image to imgbb
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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    res.json(result);
  } catch (err: any) {
    console.error('Error during OpenRouter request:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze image with OpenRouter AI.' });
  }
});

export default router;
