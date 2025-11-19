import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initGEE, calculateCarbon } from './geeClient.js';
import { calculateCarbonCredits, getProjectSuggestions } from './carbonCredits.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

app.post('/api/calculate-carbon', async (req, res) => {
  try {
    const { geometry } = req.body;
    if (!geometry) {
      return res.status(400).json({ error: 'geometry required (GeoJSON geometry)' });
    }
    const totals = await calculateCarbon(geometry);
    
    // Calculate carbon credit estimates
    const creditData = calculateCarbonCredits(totals.total_tonnes);
    const suggestions = creditData ? getProjectSuggestions(creditData) : [];
    
    res.json({
      ...totals,
      credits: creditData,
      suggestions
    });
  } catch (err) {
    console.error('calculate-carbon failed', err);
    res.status(500).json({ error: 'calculation failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

initGEE()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to init Google Earth Engine', err);
    process.exit(1);
  });
