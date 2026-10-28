import { describe, expect, it } from 'vitest';
import './registerLifecycle.js';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Workout } from '../src/models/Workout.js';
import { mongoUserId } from '../src/middleware/auth.js';
import { agent, createWorkout, csrfFor, loginGoogle, registerUser, sampleWorkout } from './helpers.js';

describe('S3-01 Google and local users can save owner-scoped workouts', () => {
  it('lets a mocked Google user create, read, and list their own workout', async () => {
    const googleUser = agent();
    const { response: login } = await loginGoogle(googleUser);
    expect(login.status).toBe(200);
    expect(login.body.user.authProvider).toBe('google');
    expect(login.body.user.id).toMatch(/^[a-f0-9]{24}$/);
    expect(login.body.user.googleId).toBeUndefined();

    const created = await createWorkout(googleUser, { title: 'Google user session' });
    expect(created.response.status).toBe(201);
    expect(created.response.body.workout.title).toBe('Google user session');
    expect(created.response.body.workout.owner).toBeUndefined();

    const id = created.response.body.workout.id;
    const read = await googleUser.get(`/api/workouts/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.workout.id).toBe(id);

    const list = await googleUser.get('/api/workouts');
    expect(list.body.workouts).toHaveLength(1);

    const storedUser = await User.findOne({ email: 'jordan@example.com' });
    const storedWorkout = await Workout.findById(id);
    expect(storedUser.googleId).toBe('google-user-123');
    expect(storedWorkout.owner.toString()).toBe(storedUser._id.toString());
    expect(storedWorkout.owner.toString()).not.toBe(storedUser.googleId);
  });

  it('treats only a Mongo ObjectId as a session user identity', () => {
    const id = new mongoose.Types.ObjectId();
    expect(mongoUserId({ _id: id })).toBe(id.toString());
    expect(mongoUserId({ id: id.toString() })).toBe(id.toString());
    expect(mongoUserId({ id: 'google-user-123' })).toBeNull();
    expect(mongoUserId({ id: '108192837465' })).toBeNull();
  });

  it('keeps Google and local workouts isolated even when the workout id is known', async () => {
    const googleUser = agent();
    await loginGoogle(googleUser);
    const googleWorkout = await createWorkout(googleUser, { title: 'Google only' });
    expect(googleWorkout.response.status).toBe(201);
    const googleId = googleWorkout.response.body.workout.id;

    const localUser = agent();
    await registerUser(localUser);
    const localWorkout = await createWorkout(localUser, { title: 'Local only' });
    expect(localWorkout.response.status).toBe(201);
    const localId = localWorkout.response.body.workout.id;

    expect((await localUser.get(`/api/workouts/${googleId}`)).status).toBe(404);
    expect((await googleUser.get(`/api/workouts/${localId}`)).status).toBe(404);

    const localToken = await csrfFor(localUser);
    const hijack = await localUser
      .patch(`/api/workouts/${googleId}`)
      .set('X-CSRF-Token', localToken)
      .send(sampleWorkout({ title: 'Stolen' }));
    expect(hijack.status).toBe(404);

    const googleToken = await csrfFor(googleUser);
    const remove = await googleUser.delete(`/api/workouts/${localId}`).set('X-CSRF-Token', googleToken);
    expect(remove.status).toBe(404);

    expect((await googleUser.get(`/api/workouts/${googleId}`)).status).toBe(200);
    expect((await localUser.get(`/api/workouts/${localId}`)).status).toBe(200);
  });
});
