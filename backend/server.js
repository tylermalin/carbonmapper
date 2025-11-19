// Run setup-env.js first to handle Vercel secrets
import './setup-env.js';

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
    // Ensure GEE is initialized (lazy initialization for Vercel)
    await ensureGEEInitialized();
    
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
    res.status(500).json({ 
      error: 'calculation failed',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Initialize GEE - for Vercel, this runs on cold start
// For local dev, start the server after initialization
let geeInitialized = false;

async function ensureGEEInitialized() {
  if (!geeInitialized) {
    try {
      await initGEE();
      geeInitialized = true;
      console.log('Google Earth Engine initialized successfully');
    } catch (err) {
      console.error('Failed to init Google Earth Engine', err);
      throw err;
    }
  }
}

// For local development, initialize and start server
if (process.env.VERCEL !== '1') {
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
} else {
  // For Vercel, export the app (serverless function)
  // GEE will initialize on first request
  console.log('Running in Vercel serverless mode');
}

// Export app for Vercel
export default app;
