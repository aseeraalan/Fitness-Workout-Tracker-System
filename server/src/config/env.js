import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

function readEnv(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === null ? fallback : String(value);
}

export function isGoogleConfigured() {
  return Boolean(
    readEnv('GOOGLE_CLIENT_ID').trim() &&
      readEnv('GOOGLE_CLIENT_SECRET').trim() &&
      readEnv('GOOGLE_CALLBACK_URL').trim()
  );
}

export function getConfig() {
  const nodeEnv = readEnv('NODE_ENV', 'development');
  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    port: Number(readEnv('PORT', '5000')),
    mongoUri: readEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/fitness_tracker'),
    sessionSecret: readEnv('SESSION_SECRET', 'dev-only-change-me'),
    frontendOrigin: readEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
    backendOrigin: readEnv('BACKEND_ORIGIN', 'http://localhost:5000'),
    googleClientId: readEnv('GOOGLE_CLIENT_ID').trim(),
    googleClientSecret: readEnv('GOOGLE_CLIENT_SECRET').trim(),
    googleCallbackUrl: readEnv(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:5000/api/auth/google/callback'
    ).trim(),
    googleEnabled: isGoogleConfigured(),
  };
}
