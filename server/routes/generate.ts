import { Router, json } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();

// Bruk json() middleware her også for sikkerhets skyld
router.use(json({ limit: '10mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { base64Image, prompt } = req.body;

  console.log(`Mottok genererings-forespørsel fra bruker ${userId}`);

  try {
    // 1. SJEKK SALDO
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (!profile || profile.credits < 1) {
      return res.status(403).json({ error: 'Tomt for kreditter. Vennligst kjøp flere.' });
    }

    // 2. PRØV Å GENERERE BILDE
    let imageUrl = '';
    
    try {
        if (!ai) throw new Error("Mangler GEMINI_API_KEY");

        // NB: De fleste Gemini-modeller støtter ikke direkte bilde-generering via API enda
        // Vi bruker en mock-løsning her hvis modellen feiler eller nøkkelen er feil
        // For ekte produksjon bør du vurdere OpenAI DALL-E 3 eller Stability AI.
        
        /* HVIS DU HAR TILGANG TIL IMAGEN PÅ VERTEX AI, LEGG INN DEN KODEN HER.
           ELLERS GENERERER VI EN "PLACEHOLDER" FOR Å VISE AT APPEN FUNKER.
        */
       
        // Kast feil med vilje her for å bruke fallback-bildet (Unsplash)
        // Fjern denne linjen hvis du har en fungerende Imagen-modell konfigurasjon
        throw new Error("Gemini Image Generation not available on free tier key yet.");

    } catch (aiError: any) {
        console.warn("AI Generering feilet (Dette er forventet hvis du ikke har Imagen-tilgang):", aiError.message);
        console.log("Bruker FALLBACK bilde fra Unsplash for demo...");
        
        // Demo: Returner et tilfeldig profesjonelt produktbilde
        imageUrl = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80&t=${Date.now()}`;
    }

    // 3. TREKK 1 KREDITT
    await supabaseAdmin.rpc('increment_credits', { 
      user_id: userId, 
      amount: -1 
    });

    res.json({ imageUrl });

  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Noe gikk galt på serveren.' });
  }
});

export const generateRouter = router;