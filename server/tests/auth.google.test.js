import { describe, expect, it } from 'vitest';
import './registerLifecycle.js';
import { User } from '../src/models/User.js';
import { findOrCreateGoogleUser } from '../src/services/googleAuth.js';
import { agent, csrfFor, loginUser, registerUser } from './helpers.js';

const googleProfile = {
  id: 'google-user-123',
  displayName: 'Jordan Miles',
  emails: [{ value: 'jordan@example.com' }],
};

describe('S1-06 Google authentication (mocked provider responses)', () => {
  it('creates a Google user from a mocked provider profile and signs them in', async () => {
    const testAgent = agent();
    const token = await csrfFor(testAgent);
    const response = await testAgent
      .post('/api/auth/google/mock')
      .set('X-CSRF-Token', token)
      .send({ profile: googleProfile });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('jordan@example.com');
    expect(response.body.user.authProvider).toBe('google');
    expect(response.body.user.googleId).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();

    const stored = await User.findOne({ email: 'jordan@example.com' }).select('+passwordHash');
    expect(stored.googleId).toBe('google-user-123');
    expect(stored.passwordHash).toBeFalsy();

    const me = await testAgent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('jordan@example.com');
  });

  it('reuses an existing Google account identified by provider id', async () => {
    await findOrCreateGoogleUser(googleProfile);
    const again = await findOrCreateGoogleUser({
      ...googleProfile,
      displayName: 'Changed Name',
    });
    expect(again.googleId).toBe('google-user-123');
    expect(await User.countDocuments()).toBe(1);
  });

  it('does not auto-link a local account that shares the Google email', async () => {
    await registerUser(agent(), {
      email: 'jordan@example.com',
      username: 'localjordan',
    });

    const testAgent = agent();
    const token = await csrfFor(testAgent);
    const response = await testAgent
      .post('/api/auth/google/mock')
      .set('X-CSRF-Token', token)
      .send({ profile: googleProfile });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('ACCOUNT_LINKING_REQUIRED');
    expect(response.body.error.message).toMatch(/username and password/i);
  });

  it('fails when the mocked Google profile is missing an identifier', async () => {
    const testAgent = agent();
    const token = await csrfFor(testAgent);
    const response = await testAgent
      .post('/api/auth/google/mock')
      .set('X-CSRF-Token', token)
      .send({ profile: { displayName: 'No Id', emails: [{ value: 'noid@example.com' }] } });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('GOOGLE_AUTH_FAILED');
  });

  it('reports Google sign-in as unavailable when credentials are not configured', async () => {
    const response = await agent().get('/api/auth/google');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('GOOGLE_UNAVAILABLE');

    const config = await agent().get('/api/auth/config');
    expect(config.body.googleEnabled).toBe(false);
  });

  it('tells a Google-only account to use Google instead of a password', async () => {
    const testAgent = agent();
    const token = await csrfFor(testAgent);
    await testAgent
      .post('/api/auth/google/mock')
      .set('X-CSRF-Token', token)
      .send({ profile: googleProfile });

    const passwordLogin = await loginUser(agent(), 'jordan@example.com', 'Whatever1');
    expect(passwordLogin.status).toBe(401);
    expect(passwordLogin.body.error.code).toBe('GOOGLE_ACCOUNT');
  });
});

describe('Real Google sign-in (credentials required)', () => {
  it.skip('completes a live Google OAuth redirect and callback — skipped because live Google credentials and an interactive browser are required', () => {
    // Manual demo: configure GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL, then use Continue with Google.
  });
});
