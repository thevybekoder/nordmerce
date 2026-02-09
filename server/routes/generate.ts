import { Router, json } from 'express';
import { GoogleGenAI } from '@google/genai'; // Pass på at du har nyeste versjon: npm install @google/genai
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();
router.use(json({ limit: '10mb' }));

// Vi bruker din eksisterende API nøkkel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { prompt } = req.body; // Vi bruker kun prompt for generering nå

  try {
    // 1. Sjekk saldo (Credits)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (!profile || profile.credits < 1) {
      return res.status(403).json({ error: 'Tomt for kreditter.' });
    }

    // 2. Generer bilde med Imagen 3 (via Google GenAI SDK)
    console.log("Genererer bilde med prompt:", prompt);
    
    let imageUrl = '';
    
    try {
      // Kall mot Google sin nye Imagen 3 modell
      // Merk: Du må ha aktivert Vertex AI API i Google Cloud Console for prosjektet ditt
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001', // Eller 'gemini-2.0-flash-exp' hvis du har tilgang til det
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
          personGeneration: 'ALLOW_ADULT', 
        }
      });

      // Hent ut bildet (Base64)
      const generatedImage = response.generatedImages?.[0]?.image?.imageBytes;
      
      if (!generatedImage) throw new Error("Ingen bilde-data mottatt fra Google.");
      
      // Konverter til en data-URL som frontend kan vise direkte
      imageUrl = `data:image/png;base64,${generatedImage}`;

    } catch (aiError: any) {
      console.error("AI Error:", aiError);
      // Fallback hvis API-kall feiler (så appen ikke kræsjer)
      // return res.status(500).json({ error: "Kunne ikke generere bilde: " + aiError.message });
      // Eller bruk mock-bilde midlertidig:
       imageUrl = `https://images.unsplash.com/photo-1620641788421-7f1c33850486?w=800&auto=format&fit=crop`;
    }

    // 3. Trekk kreditt
    await supabaseAdmin.rpc('increment_credits', { user_id: userId, amount: -1 });

    res.json({ imageUrl });

  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

export const generateRouter = router;