import { afterAll, afterEach, beforeAll } from 'vitest';
import { clearDatabase, startTestApp, stopTestApp } from './helpers.js';

beforeAll(async () => {
  await startTestApp();
}, 60_000);

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await stopTestApp();
});
