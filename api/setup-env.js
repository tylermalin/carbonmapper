import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// If GEE_SERVICE_ACCOUNT_KEY is set (from Vercel secret), write it to a file
const keyFromEnv = process.env.GEE_SERVICE_ACCOUNT_KEY;
if (keyFromEnv) {
  const keyPath = '/tmp/gee-key.json';
  try {
    // Parse and stringify to ensure valid JSON format
    let keyContent = keyFromEnv;
    try {
      // If it's already a JSON string, parse and re-stringify to ensure formatting
      const parsed = JSON.parse(keyFromEnv);
      keyContent = JSON.stringify(parsed);
    } catch (e) {
      // If parsing fails, assume it's already a string and use as-is
      keyContent = keyFromEnv;
    }
    
    fs.writeFileSync(keyPath, keyContent, 'utf8');
    process.env.GEE_KEY_FILE = keyPath;
    console.log('Service account key written from environment variable to', keyPath);
  } catch (err) {
    console.error('Failed to write service account key:', err);
    console.error('Error details:', err.message, err.stack);
  }
} else if (!process.env.GEE_KEY_FILE) {
  // Fallback for local development
  const localKeyPath = join(__dirname, '../service-account-key.json');
  if (fs.existsSync(localKeyPath)) {
    process.env.GEE_KEY_FILE = localKeyPath;
    console.log('Using local service account key');
  } else {
    console.warn('No GEE_SERVICE_ACCOUNT_KEY or GEE_KEY_FILE found');
  }
}

