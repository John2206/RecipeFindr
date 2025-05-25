// routes/openrouter.ts
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

const router = express.Router();

interface AnalyzeImageRequest extends Request {
  body: {
    imageUrl?: string;
    imageBase64?: string;
  };
}

interface ImgBBUploadResponse {
  success: boolean;
  data: {
    url: string;
  };
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
}

interface OpenRouterResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// Helper: Upload base64 image to ImgBB and return the public URL
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
  
  const data = await response.json() as ImgBBUploadResponse;
  if (!data.success) {
    console.error('ImgBB upload failed:', data);
    throw new Error('Failed to upload image to ImgBB');
  }
  return data.data.url;
}

// POST /api/openrouter/analyze-image
// @ts-ignore - Express router type issue, but functionality works correctly
router.post('/analyze-image', async (req: AnalyzeImageRequest, res: Response) => {
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
    
    const requestBody: OpenRouterRequest = {
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
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await openRouterResponse.json() as OpenRouterResponse;
    res.json(result);
  } catch (err) {
    console.error('Error analyzing image:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
