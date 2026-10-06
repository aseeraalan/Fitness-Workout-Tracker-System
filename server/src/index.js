import mongoose from 'mongoose';
import { getConfig } from './config/env.js';
import { createApp } from './app.js';

const config = getConfig();

if (!config.sessionSecret || config.sessionSecret === 'dev-only-change-me') {
  if (config.isProduction) {
    console.error('SESSION_SECRET must be set in production.');
    process.exit(1);
  }
  console.warn('Using the default SESSION_SECRET. Set SESSION_SECRET in .env before deploying.');
}

if (process.env.MONGO_MEMORY === 'true' || config.mongoUri === 'memory') {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const memory = await MongoMemoryServer.create();
  config.mongoUri = memory.getUri();
  console.log('Using in-memory MongoDB. Data is discarded when the server stops.');
}

await mongoose.connect(config.mongoUri);
const app = createApp({ config });

app.listen(config.port, () => {
  console.log(`Fitness Tracker API listening on ${config.backendOrigin}`);
  if (!config.googleEnabled) {
    console.log(
      'Google sign-in is disabled until GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL are set.'
    );
  }
});
