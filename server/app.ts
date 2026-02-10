import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRouter } from './routes/generate';
import { billingRouter } from './routes/billing';
import { userRouter } from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// VIKTIG: Billing MÅ komme før json-parseren, fordi Stripe trenger "rå" data
// Men vi forbedrer dette ved å lagre rawBody i json-parseren for spesifikke ruter
app.use(express.json({ 
  limit: '50mb',
  verify: (req: any, res, buf) => {
    if (req.originalUrl.includes('/api/billing/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/billing', billingRouter);
app.use('/api/user', userRouter);

// Routes
app.use('/api/generate', generateRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Nordic Studio API is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});