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

// 2. ABONNEMENT (Månedlig trekk)
router.post('/create-checkout-session', json(), authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userEmail = req.user!.email; 
    const { priceId: bodyPriceId } = req.body || {};
    
    const priceId = bodyPriceId || process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return res.status(400).json({ error: "No Price ID provided." });
    }

    // 1. Check if user is already a Pro member
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();

    if (profile?.is_pro) {
      return res.status(400).json({ error: 'You are already a Pro member.' });
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
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

// 2b. AVSLUTT ABONNEMENT
router.post('/cancel-subscription', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const userEmail = req.user!.email;
    const userId = req.user!.userId;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // 1. Find Stripe Customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'Stripe customer not found' });
    }
    const customer = customers.data[0];

    // 2. Find Active Subscription
    const subscriptions = await stripe.subscriptions.list({ 
      customer: customer.id, 
      status: 'active',
      limit: 1 
    });

    if (subscriptions.data.length === 0) {
      // Fallback: Check for trialing or strictly check DB
      // If no stripe sub exists but DB says is_pro, we just update DB
      console.warn("No active Stripe subscription found for user, but forcefully removing Pro status.");
    } else {
      // 3. Cancel at period end
      const subId = subscriptions.data[0].id;
      await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    }

    // 4. Update Supabase (Revoke Pro immediately per instruction)
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ is_pro: false })
      .eq('id', userId);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'Subscription cancelled successfully' });

  } catch (error: any) {
    console.error("Cancel error:", error);
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