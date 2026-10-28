import { describe, expect, it } from 'vitest';
import './registerLifecycle.js';
import { User } from '../src/models/User.js';
import { agent, registerUser } from './helpers.js';

describe('S1-03 / S1-04 / S1-08 registration', () => {
  it('registers a local account, hashes the password, and authenticates the session', async () => {
    const testAgent = agent();
    const { response, payload } = await registerUser(testAgent);

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('alex@example.com');
    expect(response.body.user.username).toBe('alexrunner');
    expect(response.body.user.name).toBe('Alex Runner');
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();

    const stored = await User.findOne({ email: payload.email }).select('+passwordHash');
    expect(stored).toBeTruthy();
    expect(stored.passwordHash).toBeTruthy();
    expect(stored.passwordHash).not.toBe(payload.password);
    expect(stored.confirmPassword).toBeUndefined();
    expect(await stored.verifyPassword(payload.password)).toBe(true);

    const me = await testAgent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('alexrunner');
  });

  it('rejects a duplicate email', async () => {
    await registerUser(agent());
    const second = await registerUser(agent(), {
      username: 'otheruser',
      email: 'alex@example.com',
    });
    expect(second.response.status).toBe(409);
    expect(second.response.body.error.code).toBe('DUPLICATE');
    expect(second.response.body.error.details.email).toMatch(/email/i);
  });

  it('rejects a duplicate username', async () => {
    await registerUser(agent());
    const second = await registerUser(agent(), {
      username: 'alexrunner',
      email: 'other@example.com',
    });
    expect(second.response.status).toBe(409);
    expect(second.response.body.error.code).toBe('DUPLICATE');
    expect(second.response.body.error.details.username).toMatch(/username/i);
  });

  it('rejects invalid registration inputs', async () => {
    const cases = [
      { name: '', email: 'a@b.com', username: 'validuser', password: 'Secure123', confirmPassword: 'Secure123' },
      { name: 'Al', email: 'not-an-email', username: 'validuser', password: 'Secure123', confirmPassword: 'Secure123' },
      { name: 'Al', email: 'a@b.com', username: 'ab', password: 'Secure123', confirmPassword: 'Secure123' },
      { name: 'Al', email: 'a@b.com', username: '1bad', password: 'Secure123', confirmPassword: 'Secure123' },
      { name: 'Al', email: 'a@b.com', username: 'validuser', password: 'short1', confirmPassword: 'short1' },
      { name: 'Al', email: 'a@b.com', username: 'validuser', password: 'NoNumber', confirmPassword: 'NoNumber' },
      { name: 'Al', email: 'a@b.com', username: 'validuser', password: 'Secure123', confirmPassword: 'Mismatch1' },
    ];

    for (const overrides of cases) {
      const { response } = await registerUser(agent(), overrides);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('does not trim passwords and rejects unexpected fields', async () => {
    const padded = await registerUser(agent(), {
      password: '  Secure123',
      confirmPassword: '  Secure123',
    });
    expect(padded.response.status).toBe(201);

    const extra = await registerUser(agent(), {
      email: 'extra@example.com',
      username: 'extrauser',
      role: 'admin',
    });
    expect(extra.response.status).toBe(400);
    expect(extra.response.body.error.message).toMatch(/unexpected/i);
  });
});
