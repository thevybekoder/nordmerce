import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../util/auth';

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
}

// NOTE: This is in-memory for demo only. Replace with a real database in production.
const users = new Map<string, UserRecord>(); // key: email

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase();
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: Date.now().toString(),
    email: normalizedEmail,
    passwordHash,
  };
  users.set(normalizedEmail, user);

  const token = signToken({ userId: user.id, email: user.email });
  return res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase();
  const existing = users.get(normalizedEmail);
  if (!existing) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const ok = await bcrypt.compare(password, existing.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signToken({ userId: existing.id, email: existing.email });
  return res.json({ token, user: { id: existing.id, email: existing.email } });
});

export const authRouter = router;


