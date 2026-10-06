import { describe, expect, it } from 'vitest';
import { agent, csrfFor, registerUser } from './helpers.js';

describe('S1-07 / S1-08 profile APIs', () => {
  it('denies unauthenticated profile access', async () => {
    const getRes = await agent().get('/api/profile');
    expect(getRes.status).toBe(401);
    expect(getRes.body.error.code).toBe('UNAUTHENTICATED');

    const tokenAgent = agent();
    const token = await csrfFor(tokenAgent);
    const patchRes = await tokenAgent
      .patch('/api/profile')
      .set('X-CSRF-Token', token)
      .send({ name: 'Hacker' });
    expect(patchRes.status).toBe(401);
  });

  it('returns and updates only the authenticated user profile', async () => {
    const first = agent();
    await registerUser(first);

    const second = agent();
    await registerUser(second, {
      name: 'Sam Lift',
      email: 'sam@example.com',
      username: 'samlift',
    });

    const mine = await first.get('/api/profile');
    expect(mine.status).toBe(200);
    expect(mine.body.user.username).toBe('alexrunner');
    expect(mine.body.user.email).toBe('alex@example.com');

    const token = await csrfFor(first);
    const updated = await first.patch('/api/profile').set('X-CSRF-Token', token).send({
      name: 'Alex Updated',
      username: 'alexupdated',
      heightCm: 180,
      weightKg: 75.5,
      fitnessGoal: 'build_muscle',
    });

    expect(updated.status).toBe(200);
    expect(updated.body.user.name).toBe('Alex Updated');
    expect(updated.body.user.username).toBe('alexupdated');
    expect(updated.body.user.email).toBe('alex@example.com');
    expect(updated.body.user.heightCm).toBe(180);
    expect(updated.body.user.weightKg).toBe(75.5);

    const other = await second.get('/api/profile');
    expect(other.body.user.username).toBe('samlift');
    expect(other.body.user.name).toBe('Sam Lift');
  });

  it('rejects duplicate usernames, invalid measurements, and sensitive field changes', async () => {
    const first = agent();
    await registerUser(first);

    const second = agent();
    await registerUser(second, {
      email: 'sam@example.com',
      username: 'samlift',
    });

    const token = await csrfFor(second);
    const duplicate = await second
      .patch('/api/profile')
      .set('X-CSRF-Token', token)
      .send({ username: 'alexrunner' });
    expect(duplicate.status).toBe(409);

    const invalid = await second
      .patch('/api/profile')
      .set('X-CSRF-Token', token)
      .send({ heightCm: 12 });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR');

    const sensitive = await second
      .patch('/api/profile')
      .set('X-CSRF-Token', token)
      .send({ email: 'root@example.com', passwordHash: 'stolen' });
    expect(sensitive.status).toBe(400);
    expect(sensitive.body.error.message).toMatch(/unexpected/i);
  });
});
