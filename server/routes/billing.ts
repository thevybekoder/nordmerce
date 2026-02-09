import { Router } from 'express';
import Stripe from 'stripe';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

if (!stripe) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. /api/billing routes will be disabled.');
}

router.post('/checkout', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured on server.' });
    }

    const { quantity } = req.body as { quantity?: number };
    const credits = quantity && quantity > 0 ? quantity : 10;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Nordic Studio Credits (${credits})`,
            },
            unit_amount: 100, // $1 per credit example
          },
          quantity: credits,
        },
      ],
      metadata: {
        userId: req.user!.userId,
        credits,
      },
      success_url: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000?billing=success',
      cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000?billing=cancel',
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

// NOTE: In production you must also implement a Stripe webhook receiver
// (e.g. /api/billing/webhook) that verifies events and actually increments
// stored credits in your database for the userId in metadata.

export const billingRouter = router;


