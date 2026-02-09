import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// En enkel Supabase klient for å verifisere tokens
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface AuthedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

export async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Mangler token.' });
  }

  const token = header.substring('Bearer '.length);
  
  // Spør Supabase: "Er denne brukeren ekte?"
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Ugyldig token.' });
  }

  req.user = { userId: user.id, email: user.email };
  next();
}