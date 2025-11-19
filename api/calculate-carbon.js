// Vercel serverless function for /api/calculate-carbon
import './setup-env.js';
import { initGEE, calculateCarbon } from './geeClient.js';
import { calculateCarbonCredits, getProjectSuggestions } from './carbonCredits.js';

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

export default async function handler(req, res) {
  // Set CORS headers
  const origin = process.env.FRONTEND_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log environment check
    console.log('GEE_KEY_FILE:', process.env.GEE_KEY_FILE);
    console.log('GEE_SERVICE_ACCOUNT_KEY exists:', !!process.env.GEE_SERVICE_ACCOUNT_KEY);
    
    // Ensure GEE is initialized
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
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'calculation failed',
      message: err.message,
      details: err.stack
    });
  }
}

