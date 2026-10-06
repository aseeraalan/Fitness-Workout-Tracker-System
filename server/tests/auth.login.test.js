import { describe, expect, it } from 'vitest';
import { agent, csrfFor, loginUser, registerUser } from './helpers.js';

describe('S1-05 / S1-06 login, logout, and session persistence', () => {
  it('logs in with email and with username', async () => {
    await registerUser(agent());

    const emailLogin = await loginUser(agent(), 'alex@example.com', 'Secure123');
    expect(emailLogin.status).toBe(200);
    expect(emailLogin.body.user.username).toBe('alexrunner');
    expect(emailLogin.body.user.passwordHash).toBeUndefined();

    const usernameLogin = await loginUser(agent(), 'alexrunner', 'Secure123');
    expect(usernameLogin.status).toBe(200);
    expect(usernameLogin.body.user.email).toBe('alex@example.com');
  });

  it('returns a generic error for a wrong password or missing account', async () => {
    await registerUser(agent());

    const wrong = await loginUser(agent(), 'alexrunner', 'WrongPass1');
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrong.body.error.message).toBe('Invalid username/email or password.');

    const missing = await loginUser(agent(), 'nobody@example.com', 'Secure123');
    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(missing.body.error.message).toBe('Invalid username/email or password.');
  });

  it('persists authentication across subsequent requests (refresh equivalent)', async () => {
    const testAgent = agent();
    await registerUser(testAgent);

    const first = await testAgent.get('/api/auth/me');
    expect(first.status).toBe(200);

    const second = await testAgent.get('/api/profile');
    expect(second.status).toBe(200);
    expect(second.body.user.username).toBe('alexrunner');
  });

  it('invalidates the session on logout', async () => {
    const testAgent = agent();
    await registerUser(testAgent);

    const token = await csrfFor(testAgent);
    const logout = await testAgent.post('/api/auth/logout').set('X-CSRF-Token', token);
    expect(logout.status).toBe(204);

    const me = await testAgent.get('/api/auth/me');
    expect(me.status).toBe(401);

    const profile = await testAgent.get('/api/profile');
    expect(profile.status).toBe(401);
  });
});
