import { Router, json } from 'express';
import { GoogleGenAI } from '@google/genai'; 
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();

// Initialize AI with the correct package exports
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { prompt, base64Image, mimeType } = req.body;

  // Input Validation
  if (!prompt || typeof prompt !== 'string' || prompt.length > 1000) {
    return res.status(400).json({ error: 'Invalid prompt. Must be a string under 1000 chars.' });
  }

  if (base64Image && typeof base64Image !== 'string') {
    return res.status(400).json({ error: 'Invalid image data.' });
  }

  if (base64Image && (!mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))) {
    return res.status(400).json({ error: 'Invalid or missing mimeType. Supported: jpeg, png, webp.' });
  }

  try {
    // 1. Atomic Check & Deduct (Optimistic)
    // We check balance first to provide a clear error message
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (!profile || profile.credits < 1) {
      return res.status(403).json({ error: 'Insufficient credits. Please top up.' });
    }

    // Deduct credit immediately to prevent race conditions
    const { error: deductError } = await supabaseAdmin.rpc('increment_credits', { 
      user_id: userId, 
      amount: -1 
    });

    if (deductError) {
      console.error("Failed to deduct credit:", deductError);
      return res.status(500).json({ error: 'Transaction failed' });
    }

    // 2. Generate Image with Imagen 4 (Subject-driven)
    console.log("Generating image for user:", userId);
    
    let imageUrl = '';
    
    try {
      // Using Gemini 3 Pro Image Preview for Subject-Consistent Generation
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [
          {
            parts: [
              { text: `A professional product photograph of the product [1] placed in the following setting: ${prompt}. Ensure the product looks exactly like the reference image. High resolution, 4k.` },
              { 
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Image 
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' }
          ]
        }
      });

      // Extract the generated image from the content parts
      // The structure is usually candidates[0].content.parts[0].inlineData (or similar for image responses)
      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      
      if (!part || !part.inlineData || !part.inlineData.data) {
        console.error("Unexpected AI Response Structure:", JSON.stringify(response, null, 2));
        throw new Error("No image data received from Gemini.");
      }

      // The SDK usually returns 'data' as the base64 string
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

    } catch (aiError: any) {
      console.error("AI Generation Error:", aiError.message);
      
      // REFUND: If generation failed, refund the credit
      console.log("Refunding credit to user:", userId);
      await supabaseAdmin.rpc('increment_credits', { 
        user_id: userId, 
        amount: 1 
      });

      return res.status(500).json({ error: `Generation failed: ${aiError.message}` });
    }

    res.json({ imageUrl });

  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export const generateRouter = router;