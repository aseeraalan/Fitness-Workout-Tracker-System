import { describe, expect, it } from 'vitest';
import './registerLifecycle.js';
import {
  agent,
  createSession,
  createWorkout,
  csrfFor,
  loginGoogle,
  registerUser,
  sampleSession,
} from './helpers.js';

describe('S3-02 / S3-03 / S3-04 calendar and gym sessions', () => {
  it('rejects unauthenticated calendar and session requests', async () => {
    const guest = agent();
    const token = await csrfFor(guest);
    expect((await guest.get('/api/calendar?from=2026-10-01&to=2026-10-31')).status).toBe(401);
    expect((await guest.post('/api/sessions').set('X-CSRF-Token', token).send(sampleSession())).status).toBe(
      401
    );
  });

  it('rejects missing, inverted, oversized, and unexpected calendar ranges', async () => {
    const user = agent();
    await registerUser(user);

    expect((await user.get('/api/calendar')).status).toBe(400);
    expect((await user.get('/api/calendar?from=2026-10-31&to=2026-10-01')).status).toBe(400);
    expect((await user.get('/api/calendar?from=not-a-date&to=2026-10-01')).status).toBe(400);
    expect((await user.get('/api/calendar?from=2026-01-01&to=2026-12-31')).status).toBe(400);
    expect((await user.get('/api/calendar?from=2026-10-01&to=2026-10-31&owner=someone')).status).toBe(400);
  });

  it('returns only the signed-in user sessions and workouts for the requested month, including month boundaries', async () => {
    const owner = agent();
    await registerUser(owner);
    await createWorkout(owner, { date: '2026-10-31', title: 'Halloween lifts' });
    await createWorkout(owner, { date: '2026-11-01', title: 'November lifts' });
    await createSession(owner, { date: '2026-10-31', title: 'Evening gym', startTime: '20:00' });
    await createSession(owner, { date: '2026-09-30', title: 'September leftover' });

    const other = agent();
    await registerUser(other, { email: 'sam@example.com', username: 'samlift' });
    await createWorkout(other, { date: '2026-10-31', title: 'Someone else' });
    await createSession(other, { date: '2026-10-31', title: 'Other gym' });

    const october = await owner.get('/api/calendar?from=2026-10-01&to=2026-10-31');
    expect(october.status).toBe(200);
    expect(october.body.workouts.map((item) => item.title)).toEqual(['Halloween lifts']);
    expect(october.body.sessions.map((item) => item.title)).toEqual(['Evening gym']);
    expect(october.body.workouts[0].date).toBe('2026-10-31');
    expect(october.body.sessions[0].date).toBe('2026-10-31');

    const november = await owner.get('/api/calendar?from=2026-11-01&to=2026-11-30');
    expect(november.body.workouts.map((item) => item.title)).toEqual(['November lifts']);
    expect(november.body.sessions).toHaveLength(0);
  });

  it('keeps UTC-midnight stored dates on the civil calendar day, including values near midnight', async () => {
    const owner = agent();
    await registerUser(owner);
    const created = await createWorkout(owner, { date: '2026-03-01', title: 'March session' });
    expect(created.response.body.workout.date).toBe('2026-03-01');

    const february = await owner.get('/api/calendar?from=2026-02-01&to=2026-02-28');
    expect(february.body.workouts).toHaveLength(0);

    const march = await owner.get('/api/calendar?from=2026-03-01&to=2026-03-31');
    expect(march.body.workouts).toHaveLength(1);
    expect(march.body.workouts[0].date).toBe('2026-03-01');
  });

  it('lets the owner create, update, and delete a gym session and hides it from another user', async () => {
    const owner = agent();
    await registerUser(owner);
    const created = await createSession(owner);
    expect(created.response.status).toBe(201);
    const id = created.response.body.session.id;

    const other = agent();
    await registerUser(other, { email: 'sam@example.com', username: 'samlift' });
    expect((await other.get(`/api/sessions/${id}`)).status).toBe(404);

    const token = await csrfFor(owner);
    const updated = await owner.patch(`/api/sessions/${id}`).set('X-CSRF-Token', token).send(
      sampleSession({ title: 'Updated gym block', startTime: '07:00' })
    );
    expect(updated.status).toBe(200);
    expect(updated.body.session.title).toBe('Updated gym block');
    expect(updated.body.session.startTime).toBe('07:00');

    const otherToken = await csrfFor(other);
    expect(
      (await other.delete(`/api/sessions/${id}`).set('X-CSRF-Token', otherToken)).status
    ).toBe(404);

    expect((await owner.delete(`/api/sessions/${id}`).set('X-CSRF-Token', token)).status).toBe(204);
    expect((await owner.get(`/api/sessions/${id}`)).status).toBe(404);
  });

  it('lets a mocked Google user schedule a session and see it on the calendar', async () => {
    const googleUser = agent();
    await loginGoogle(googleUser);
    const created = await createSession(googleUser, { date: '2026-10-26', title: 'Google gym' });
    expect(created.response.status).toBe(201);
    const calendar = await googleUser.get('/api/calendar?from=2026-10-01&to=2026-10-31');
    expect(calendar.body.sessions.map((item) => item.title)).toEqual(['Google gym']);
  });
});

describe('S3-05 progress from saved workouts', () => {
  it('computes workouts completed and highest kg per workout for a selected exercise', async () => {
    const user = agent();
    await registerUser(user);
    await createWorkout(user, {
      date: '2026-10-01',
      title: 'A',
      exercises: [
        {
          name: 'Back squat',
          sets: [
            { reps: 5, weightKg: 80 },
            { reps: 3, weightKg: 90 },
          ],
        },
      ],
    });
    await createWorkout(user, {
      date: '2026-10-08',
      title: 'B',
      exercises: [{ name: 'back squat', sets: [{ reps: 5, weightKg: 95 }] }],
    });
    await createWorkout(user, {
      date: '2026-10-08',
      title: 'C',
      exercises: [{ name: 'Bench press', sets: [{ reps: 8, weightKg: 60 }] }],
    });

    const all = await user.get('/api/progress?from=2026-10-01&to=2026-10-31');
    expect(all.status).toBe(200);
    expect(all.body.unit).toBe('kg');
    expect(all.body.workoutsCompleted).toBe(3);
    expect(all.body.points).toEqual([]);
    expect(all.body.exercises.map((name) => name.toLowerCase())).toContain('back squat');

    const squat = await user.get('/api/progress?from=2026-10-01&to=2026-10-31&exercise=Back%20squat');
    expect(squat.body.points).toEqual([
      expect.objectContaining({ date: '2026-10-01', title: 'A', highestWeightKg: 90 }),
      expect.objectContaining({ date: '2026-10-08', title: 'B', highestWeightKg: 95 }),
    ]);
  });

  it('does not include another user workouts in progress and requires a bounded range', async () => {
    const owner = agent();
    await registerUser(owner);
    await createWorkout(owner, { date: '2026-10-18', title: 'Mine' });

    const other = agent();
    await registerUser(other, { email: 'sam@example.com', username: 'samlift' });
    await createWorkout(other, {
      date: '2026-10-18',
      title: 'Theirs',
      exercises: [{ name: 'Deadlift', sets: [{ reps: 5, weightKg: 140 }] }],
    });

    const progress = await owner.get('/api/progress?from=2026-10-01&to=2026-10-31&exercise=Deadlift');
    expect(progress.body.workoutsCompleted).toBe(1);
    expect(progress.body.points).toEqual([]);

    expect((await owner.get('/api/progress')).status).toBe(400);
    expect((await agent().get('/api/progress?from=2026-10-01&to=2026-10-31')).status).toBe(401);
    expect((await owner.get('/api/progress?from=2026-01-01&to=2026-12-31')).status).toBe(400);
  });

  it('returns an empty progress payload when the user has no workouts in range', async () => {
    const user = agent();
    await registerUser(user);
    const progress = await user.get('/api/progress?from=2026-10-01&to=2026-10-31');
    expect(progress.status).toBe(200);
    expect(progress.body.workoutsCompleted).toBe(0);
    expect(progress.body.exercises).toEqual([]);
    expect(progress.body.points).toEqual([]);
    expect(progress.body.unit).toBe('kg');
  });

  it('rejects a calendar range of 46 days and accepts 45 inclusive days across a month boundary', async () => {
    const user = agent();
    await registerUser(user);
    expect((await user.get('/api/calendar?from=2026-10-01&to=2026-11-15')).status).toBe(400);
    expect((await user.get('/api/calendar?from=2026-10-01&to=2026-11-14')).status).toBe(200);
  });

  it('rejects gym session creates without a CSRF token', async () => {
    const user = agent();
    await registerUser(user);
    const response = await user.post('/api/sessions').send(sampleSession());
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF');
  });
});
