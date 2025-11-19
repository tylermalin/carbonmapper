// Vercel serverless function for /api/health
export default function handler(req, res) {
  const origin = process.env.FRONTEND_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  
  res.json({ status: 'ok' });
}

