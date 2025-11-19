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
    fs.writeFileSync(keyPath, keyFromEnv);
    process.env.GEE_KEY_FILE = keyPath;
    console.log('Service account key written from environment variable');
  } catch (err) {
    console.error('Failed to write service account key:', err);
  }
} else if (!process.env.GEE_KEY_FILE) {
  // Fallback for local development
  const localKeyPath = join(__dirname, '../service-account-key.json');
  if (fs.existsSync(localKeyPath)) {
    process.env.GEE_KEY_FILE = localKeyPath;
    console.log('Using local service account key');
  }
}

