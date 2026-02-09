import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRouter } from './routes/generate';
import { billingRouter } from './routes/billing';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// VIKTIG: Billing MÅ komme før json-parseren, fordi Stripe trenger "rå" data
app.use('/api/billing', billingRouter);

// HER ER ENDRINGEN: Vi tillater nå opptil 50mb (nok til store bilder)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/generate', generateRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Nordic Studio API is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});