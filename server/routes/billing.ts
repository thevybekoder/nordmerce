// server/routes/billing.ts
import { Router, raw, json } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();
// Vi bruker apiVersion 2024-12-18.1 eller nyere, men beholder din config hvis den virker
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. KJØP CREDITS (Engangsbeløp)
router.post('/checkout', json(), authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { quantity = 10 } = req.body || {};
    const userId = req.user!.userId;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'nok',
          product_data: { name: `${quantity} AI Credits` },
          unit_amount: 1000, // 10 NOK per pakke
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?canceled=true`,
      metadata: { userId, type: 'credits', amount: quantity.toString() }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ABONNEMENT (Månedlig trekk - 199kr)
router.post('/subscribe', json(), authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userEmail = req.user!.email; 
    
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      throw new Error("STRIPE_PRO_PRICE_ID is not configured.");
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();

    if (profile?.is_pro) {
      return res.status(400).json({ error: 'Du har allerede et Pro-abonnement.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // Bruker Price ID fra dashboard istedenfor hardkodet beløp
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?success=subscription_active`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}?canceled=true`,
      customer_email: userEmail,
      metadata: { userId, type: 'subscription' }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. WEBHOOK (Håndterer at betalingen gikk gjennom)
router.post('/webhook', async (req: any, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vi bruker req.rawBody som ble fanget opp i app.ts
    event = stripe.webhooks.constructEvent(req.rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Håndter vellykket betaling
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;

    if (userId) {
      if (type === 'credits') {
        // Legg til credits som før
        const amount = parseInt(session.metadata?.amount || '0');
        await supabaseAdmin.rpc('increment_credits', { user_id: userId, amount });
      } else if (type === 'subscription') {
        // I webhooken, under if (type === 'subscription')
        await supabaseAdmin.from('profiles').update({ is_pro: true }).eq('id', userId);
        // Og legg til credits som før
        await supabaseAdmin.rpc('increment_credits', { user_id: userId, amount: 500 });
      }
    }
  }

  res.json({ received: true });
});

export const billingRouter = router;