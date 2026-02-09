import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { authMiddleware } from '../util/auth';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY (or API_KEY) not set. /api/generate will fail until configured.');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    const { base64Image, mimeType, prompt, resolution } = req.body as {
      base64Image?: string;
      mimeType?: string;
      prompt?: string;
      resolution?: '1K' | '2K' | '4K';
    };

    if (!base64Image || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing base64Image, mimeType or prompt.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: resolution || '1K',
          aspectRatio: '1:1',
        },
      },
    });

    const parts = (response as any).candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const url = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          return res.json({ imageUrl: url });
        }
      }
    }

    return res.status(500).json({ error: 'No image data found in Gemini response.' });
  } catch (error: any) {
    console.error('Gemini generation error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate image.' });
  }
});

export const generateRouter = router;


