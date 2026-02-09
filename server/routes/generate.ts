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

  try {
    // 1. Check Credit Balance
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (!profile || profile.credits < 1) {
      return res.status(403).json({ error: 'Insufficient credits. Please top up.' });
    }

    // 2. Generate Image with Imagen 3
    console.log("Generating image for user:", userId);
    
    let imageUrl = '';
    
    try {
      // Using the unified SDK's generateImages method
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
          personGeneration: 'ALLOW_ADULT', 
        }
      });

      // Handle the response bytes correctly
      const generatedImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      
      if (!generatedImageBytes) {
        throw new Error("No image data received from the AI service.");
      }
      
      // If bytes are returned as a Buffer or Uint8Array, convert to base64
      const base64Content = typeof generatedImageBytes === 'string' 
        ? generatedImageBytes 
        : Buffer.from(generatedImageBytes).toString('base64');

      imageUrl = `data:image/png;base64,${base64Content}`;

    } catch (aiError: any) {
      console.error("AI Generation Error:", aiError);
      return res.status(500).json({ error: `Generation failed: ${aiError.message}` });
    }

    // 3. Deduct Credit
    const { error: rpcError } = await supabaseAdmin.rpc('increment_credits', { 
      user_id: userId, 
      amount: -1 
    });
    
    if (rpcError) {
      console.error("Failed to deduct credit after generation:", rpcError);
    }

    res.json({ imageUrl });

  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export const generateRouter = router;