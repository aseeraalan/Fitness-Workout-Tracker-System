import { describe, expect, it } from 'vitest';
import { agent, createWorkout, csrfFor, registerUser, sampleWorkout } from './helpers.js';

async function registerPair() {
  const owner = agent();
  await registerUser(owner);
  const other = agent();
  await registerUser(other, {
    name: 'Sam Lift',
    email: 'sam@example.com',
    username: 'samlift',
  });
  return { owner, other };
}

describe('S2 workout APIs', () => {
  it('rejects unauthenticated workout requests', async () => {
    const guest = agent();
    const token = await csrfFor(guest);

    const list = await guest.get('/api/workouts');
    expect(list.status).toBe(401);
    expect(list.body.error.code).toBe('UNAUTHENTICATED');

    const create = await guest.post('/api/workouts').set('X-CSRF-Token', token).send(sampleWorkout());
    expect(create.status).toBe(401);

    const read = await guest.get('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0');
    expect(read.status).toBe(401);

    const update = await guest
      .patch('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0')
      .set('X-CSRF-Token', token)
      .send(sampleWorkout());
    expect(update.status).toBe(401);

    const remove = await guest
      .delete('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0')
      .set('X-CSRF-Token', token);
    expect(remove.status).toBe(401);
  });

  it('creates, lists, reads, updates, and deletes the owner workout', async () => {
    const { owner } = await registerPair();
    const created = await createWorkout(owner);
    expect(created.response.status).toBe(201);
    expect(created.response.body.workout.title).toBe('Lower body strength');
    expect(created.response.body.workout.date).toBe('2026-10-18');
    expect(created.response.body.workout.owner).toBeUndefined();
    expect(created.response.body.workout.exercises[0].sets[1].weightKg).toBe(85);

    const id = created.response.body.workout.id;
    const list = await owner.get('/api/workouts');
    expect(list.status).toBe(200);
    expect(list.body.workouts).toHaveLength(1);
    expect(list.body.workouts[0].id).toBe(id);

    const read = await owner.get(`/api/workouts/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.workout.notes).toBe('Felt strong.');

    const token = await csrfFor(owner);
    const updated = await owner.patch(`/api/workouts/${id}`).set('X-CSRF-Token', token).send(
      sampleWorkout({
        title: 'Updated squat day',
        notes: 'Added a pause.',
        exercises: [{ name: 'Pause squat', sets: [{ reps: 3, weightKg: 90 }] }],
      })
    );
    expect(updated.status).toBe(200);
    expect(updated.body.workout.title).toBe('Updated squat day');
    expect(updated.body.workout.exercises[0].name).toBe('Pause squat');

    const removed = await owner.delete(`/api/workouts/${id}`).set('X-CSRF-Token', token);
    expect(removed.status).toBe(204);
    const missing = await owner.get(`/api/workouts/${id}`);
    expect(missing.status).toBe(404);
  });

  it('rejects missing, invalid, and unexpected input', async () => {
    const { owner } = await registerPair();
    const token = await csrfFor(owner);

    const missing = await owner.post('/api/workouts').set('X-CSRF-Token', token).send({});
    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe('VALIDATION_ERROR');
    expect(missing.body.error.details.title).toMatch(/required/i);
    expect(missing.body.error.details.exercises).toMatch(/exercise/i);

    const invalid = await owner.post('/api/workouts').set('X-CSRF-Token', token).send(
      sampleWorkout({
        date: '2026-13-40',
        title: 'Bad data',
        exercises: [{ name: 'Curl', sets: [{ reps: 0, weightKg: -4 }] }],
      })
    );
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.details.date).toBeTruthy();
    expect(invalid.body.error.details['exercises.0.sets.0.reps']).toBeTruthy();
    expect(invalid.body.error.details['exercises.0.sets.0.weightKg']).toBeTruthy();

    const unexpected = await owner
      .post('/api/workouts')
      .set('X-CSRF-Token', token)
      .send({ ...sampleWorkout(), owner: 'someone-else', userId: 'hack' });
    expect(unexpected.status).toBe(400);
    expect(unexpected.body.error.message).toMatch(/unexpected/i);
  });

  it('allows optional notes and 0 kg bodyweight sets', async () => {
    const { owner } = await registerPair();
    const { response } = await createWorkout(owner, {
      notes: undefined,
      exercises: [{ name: 'Pull-up', sets: [{ reps: 8, weightKg: 0 }] }],
    });
    expect(response.status).toBe(201);
    expect(response.body.workout.notes).toBe('');
    expect(response.body.workout.exercises[0].sets[0].weightKg).toBe(0);
  });

  it('returns 400 for invalid IDs and 404 for missing workouts', async () => {
    const { owner } = await registerPair();
    const token = await csrfFor(owner);

    const invalid = await owner.get('/api/workouts/not-a-valid-id');
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('INVALID_ID');

    const missing = await owner.get('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0');
    expect(missing.status).toBe(404);

    const updateMissing = await owner
      .patch('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0')
      .set('X-CSRF-Token', token)
      .send(sampleWorkout());
    expect(updateMissing.status).toBe(404);

    const deleteMissing = await owner
      .delete('/api/workouts/64b0a0a0a0a0a0a0a0a0a0a0')
      .set('X-CSRF-Token', token);
    expect(deleteMissing.status).toBe(404);
  });

  it('does not allow another user to read, edit, or delete a workout even with the ID', async () => {
    const { owner, other } = await registerPair();
    const created = await createWorkout(owner);
    const id = created.response.body.workout.id;
    const token = await csrfFor(other);

    const read = await other.get(`/api/workouts/${id}`);
    expect(read.status).toBe(404);

    const update = await other.patch(`/api/workouts/${id}`).set('X-CSRF-Token', token).send(
      sampleWorkout({ title: 'Hijacked' })
    );
    expect(update.status).toBe(404);

    const remove = await other.delete(`/api/workouts/${id}`).set('X-CSRF-Token', token);
    expect(remove.status).toBe(404);

    const stillThere = await owner.get(`/api/workouts/${id}`);
    expect(stillThere.status).toBe(200);
    expect(stillThere.body.workout.title).toBe('Lower body strength');

    const otherList = await other.get('/api/workouts');
    expect(otherList.body.workouts).toHaveLength(0);
  });

  it('lists the current user workouts newest first and supports date filters plus pagination', async () => {
    const { owner } = await registerPair();
    await createWorkout(owner, { date: '2026-10-10', title: 'Early' });
    await createWorkout(owner, { date: '2026-10-22', title: 'Late' });
    await createWorkout(owner, { date: '2026-10-18', title: 'Middle' });

    const listed = await owner.get('/api/workouts');
    expect(listed.body.workouts.map((workout) => workout.title)).toEqual(['Late', 'Middle', 'Early']);

    const filtered = await owner.get('/api/workouts?from=2026-10-18&to=2026-10-18');
    expect(filtered.status).toBe(200);
    expect(filtered.body.workouts).toHaveLength(1);
    expect(filtered.body.workouts[0].title).toBe('Middle');

    for (let index = 1; index <= 9; index += 1) {
      await createWorkout(owner, { date: '2026-10-01', title: `Extra ${index}` });
    }

    const page1 = await owner.get('/api/workouts?limit=5&page=1');
    expect(page1.body.workouts).toHaveLength(5);
    expect(page1.body.total).toBe(12);
    expect(page1.body.totalPages).toBe(3);
    expect(page1.body.workouts[0].title).toBe('Late');

    const page2 = await owner.get('/api/workouts?limit=5&page=2');
    expect(page2.body.workouts).toHaveLength(5);
    expect(page2.body.page).toBe(2);

    const page3 = await owner.get('/api/workouts?limit=5&page=3');
    expect(page3.body.workouts).toHaveLength(2);

    const badQuery = await owner.get('/api/workouts?page=0&owner=someone');
    expect(badQuery.status).toBe(400);
  });
});

describe('Sprint 1 authentication regression', () => {
  it('still registers a local account and keeps the session', async () => {
    const testAgent = agent();
    const { response } = await registerUser(testAgent, {
      email: 'regression@example.com',
      username: 'regressionuser',
    });
    expect(response.status).toBe(201);
    const me = await testAgent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('regressionuser');
    expect(me.body.user.passwordHash).toBeUndefined();
  });
});
