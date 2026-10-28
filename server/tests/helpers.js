import http from 'node:http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Workout } from '../src/models/Workout.js';
import { GymSession } from '../src/models/GymSession.js';

let mongo;
let app;
let server;
let sessionStore;

export async function startTestApp() {
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-session-secret-value';
  process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
  process.env.BACKEND_ORIGIN = 'http://localhost:5000';
  process.env.GOOGLE_CLIENT_ID = '';
  process.env.GOOGLE_CLIENT_SECRET = '';
  process.env.GOOGLE_CALLBACK_URL = '';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  process.env.MONGODB_URI = mongoUri;

  await mongoose.connect(mongoUri);
  await User.init();
  await Workout.init();
  await GymSession.init();

  sessionStore = MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: 'sessions',
    ttl: 60 * 60,
  });

  app = createApp({
    config: {
      nodeEnv: 'test',
      isProduction: false,
      isTest: true,
      port: 5000,
      mongoUri,
      sessionSecret: 'test-session-secret-value',
      frontendOrigin: 'http://localhost:5173',
      backendOrigin: 'http://localhost:5000',
      googleClientId: '',
      googleClientSecret: '',
      googleCallbackUrl: '',
      googleEnabled: false,
    },
    sessionStore,
    enableGoogleMock: true,
  });

  server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (error) => (error ? reject(error) : resolve()));
  });

  return { app, mongoUri };
}

export function getApp() {
  return app;
}

export function agent() {
  if (!server) {
    throw new Error('Test app was not started. Check tests/setup.js.');
  }
  return request.agent(server);
}

export async function csrfFor(testAgent) {
  const response = await testAgent.get('/api/auth/csrf-token').expect(200);
  return response.body.csrfToken;
}

export async function registerUser(testAgent, overrides = {}) {
  const token = await csrfFor(testAgent);
  const payload = {
    name: 'Alex Runner',
    email: 'alex@example.com',
    username: 'alexrunner',
    password: 'Secure123',
    confirmPassword: 'Secure123',
    ...overrides,
  };
  const response = await testAgent
    .post('/api/auth/register')
    .set('X-CSRF-Token', token)
    .send(payload);
  return { response, payload, token };
}

export function sampleWorkout(overrides = {}) {
  return {
    date: '2026-10-18',
    title: 'Lower body strength',
    notes: 'Felt strong.',
    exercises: [
      {
        name: 'Back squat',
        sets: [
          { reps: 5, weightKg: 80 },
          { reps: 5, weightKg: 85 },
        ],
      },
    ],
    ...overrides,
  };
}

export async function createWorkout(testAgent, overrides = {}) {
  const token = await csrfFor(testAgent);
  const payload = sampleWorkout(overrides);
  const response = await testAgent
    .post('/api/workouts')
    .set('X-CSRF-Token', token)
    .send(payload);
  return { response, payload, token };
}

export const googleProfile = {
  id: 'google-user-123',
  displayName: 'Jordan Miles',
  emails: [{ value: 'jordan@example.com' }],
};

export async function loginGoogle(testAgent, profile = googleProfile) {
  const token = await csrfFor(testAgent);
  const response = await testAgent
    .post('/api/auth/google/mock')
    .set('X-CSRF-Token', token)
    .send({ profile });
  return { response, token, profile };
}

export function sampleSession(overrides = {}) {
  return {
    date: '2026-10-18',
    title: 'Gym - lower body',
    notes: 'Rack 3',
    startTime: '18:30',
    ...overrides,
  };
}

export async function createSession(testAgent, overrides = {}) {
  const token = await csrfFor(testAgent);
  const payload = sampleSession(overrides);
  const response = await testAgent.post('/api/sessions').set('X-CSRF-Token', token).send(payload);
  return { response, payload, token };
}

export async function loginUser(testAgent, identifier, password) {
  const token = await csrfFor(testAgent);
  return testAgent.post('/api/auth/login').set('X-CSRF-Token', token).send({ identifier, password });
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

export async function stopTestApp() {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    server = null;
  }
  if (sessionStore?.close) {
    await sessionStore.close();
  }
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
}
