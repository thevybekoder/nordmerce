import { Router, raw, json } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

// Admin-tilgang til databasen (for å kunne legge til kreditter)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. Start kjøp (Checkout) - Trenger JSON parsing
router.post('/checkout', json(), authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { quantity = 10 } = req.body || {};
    const userId = req.user!.userId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'nok',
          product_data: { name: `${quantity} AI Credits` },
          unit_amount: 1000, // 10 kr per pakke (endre dette tallet som du vil)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}?canceled=true`,
      metadata: {
        userId: userId, // VIKTIG: Vi sender bruker-ID til Stripe
        creditsToAdd: quantity.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook: Stripe ringer denne når betalingen er OK
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.creditsToAdd || '0');

    if (userId && credits > 0) {
      // Oppdater databasen via funksjonen vi lagde i Steg 1
      const { error } = await supabaseAdmin.rpc('increment_credits', { 
        user_id: userId, 
        amount: credits 
      });
      if (error) console.error('Feil ved oppdatering av credits:', error);
      else console.log(`La til ${credits} credits for bruker ${userId}`);
    }
  }

  res.json({ received: true });
});

export const billingRouter = router;