import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware, AuthedRequest } from '../util/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.delete('/delete-account', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  if (!userId || !userEmail) {
    return res.status(400).json({ error: 'User context missing' });
  }

  try {
    console.log(`Starting account deletion for user: ${userId}`);

    // 1. Stripe Cleanup
    try {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        
        // Cancel active subscriptions immediately
        const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'active' });
        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`Cancelled Stripe subscription: ${sub.id}`);
        }

        // Delete the customer
        await stripe.customers.del(customer.id);
        console.log(`Deleted Stripe customer: ${customer.id}`);
      }
    } catch (stripeError: any) {
      console.error("Stripe cleanup failed (continuing...):", stripeError.message);
      // We continue because we still want to delete the account even if Stripe fails
    }

    // 2. Storage Cleanup (Best Effort)
    // We assume files are stored in folders named {userId}/...
    const buckets = ['user-uploads', 'generated-results'];
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabaseAdmin.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
            const paths = files.map(f => `${userId}/${f.name}`);
            await supabaseAdmin.storage.from(bucket).remove(paths);
            console.log(`Deleted ${files.length} files from bucket ${bucket}`);
        }
        // Attempt to remove the folder itself if it's empty (Supabase storage doesn't really have folders, just paths)
      } catch (storageError: any) {
        console.error(`Storage cleanup for ${bucket} failed:`, storageError.message);
      }
    }

    // 3. Database & Auth Cleanup
    // Manual delete from public tables to ensure no FK constraints block the Auth delete
    // (Ideally handled by ON DELETE CASCADE in SQL, but this is safer)
    await supabaseAdmin.from('generated_images').delete().eq('user_id', userId);
    await supabaseAdmin.from('products').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Supabase Auth delete failed: ${deleteError.message}`);
    }

    console.log(`Successfully deleted user ${userId} from Supabase Auth.`);
    res.json({ success: true, message: 'Account deleted successfully' });

  } catch (error: any) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

export const userRouter = router;
