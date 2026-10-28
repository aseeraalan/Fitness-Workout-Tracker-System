import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';

export const sampleUser = {
  id: '1',
  name: 'Alex Runner',
  email: 'alex@example.com',
  username: 'alexrunner',
  authProvider: 'local',
  heightCm: null,
  weightKg: null,
  fitnessGoal: '',
};

function apiError(message, { status = 400, code = 'BAD_REQUEST', details = {} } = {}) {
  const error = new Error(message);
  error.status = status;
  error.payload = { message, code, details };
  throw error;
}

function toPublicWorkout(workout) {
  return {
    id: workout.id,
    date: workout.date,
    title: workout.title,
    notes: workout.notes || '',
    exercises: workout.exercises,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
  };
}

function toPublicSession(session) {
  return {
    id: session.id,
    date: session.date,
    title: session.title,
    notes: session.notes || '',
    startTime: session.startTime || '',
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function createMockClient({
  user = null,
  googleEnabled = false,
  workouts: seedWorkouts = [],
  sessions: seedSessions = [],
} = {}) {
  let currentUser = user;
  let workouts = seedWorkouts.map((workout, index) => ({
    ownerId: workout.ownerId || user?.id || '1',
    createdAt: workout.createdAt || `2026-10-18T00:00:0${index}Z`,
    updatedAt: workout.updatedAt || `2026-10-18T00:00:0${index}Z`,
    notes: workout.notes || '',
    ...workout,
  }));
  let sessions = seedSessions.map((session, index) => ({
    ownerId: session.ownerId || user?.id || '1',
    createdAt: session.createdAt || `2026-10-18T01:00:0${index}Z`,
    updatedAt: session.updatedAt || `2026-10-18T01:00:0${index}Z`,
    notes: session.notes || '',
    startTime: session.startTime || '',
    ...session,
  }));
  let nextId = workouts.length + sessions.length + 1;
  let failNextSave = false;
  let failCalendar = false;
  let failProgress = false;
  const calls = [];

  function requireUser() {
    if (!currentUser) {
      apiError('Please sign in to continue.', { status: 401, code: 'UNAUTHENTICATED' });
    }
  }

  function ownedWorkout(id) {
    if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
      apiError('That workout ID is not valid.', { status: 400, code: 'INVALID_ID' });
    }
    const workout = workouts.find((item) => item.id === id && item.ownerId === currentUser.id);
    if (!workout) {
      apiError('Workout not found.', { status: 404, code: 'NOT_FOUND' });
    }
    return workout;
  }

  return {
    calls,
    failNextSave() {
      failNextSave = true;
    },
    failNextCalendar() {
      failCalendar = true;
    },
    failNextProgress() {
      failProgress = true;
    },
    loadCsrf: async () => 'csrf-test-token',
    getConfig: async () => ({
      googleEnabled,
      googleUnavailableMessage: googleEnabled
        ? null
        : 'Google sign-in is not configured. You can still register and log in with a username and password.',
    }),
    getMe: async () => {
      if (!currentUser) {
        apiError('Please sign in to continue.', { status: 401, code: 'UNAUTHENTICATED' });
      }
      return { user: currentUser };
    },
    register: async (body) => {
      calls.push(['register', body]);
      if (body.email === 'taken@example.com') {
        apiError('That email is already registered.', {
          status: 409,
          code: 'DUPLICATE',
          details: { email: 'That email is already registered.' },
        });
      }
      currentUser = {
        ...sampleUser,
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        username: body.username.trim().toLowerCase(),
      };
      return { user: currentUser };
    },
    login: async (body) => {
      calls.push(['login', body]);
      if (body.password !== 'Secure123') {
        apiError('Invalid username/email or password.', { status: 401, code: 'INVALID_CREDENTIALS' });
      }
      currentUser = { ...sampleUser };
      return { user: currentUser };
    },
    logout: async () => {
      calls.push(['logout']);
      currentUser = null;
    },
    updateProfile: async (body) => {
      calls.push(['updateProfile', body]);
      currentUser = { ...currentUser, ...body };
      return { user: currentUser };
    },
    googleStartUrl: () => '/api/auth/google',
    listWorkouts: async (query = {}) => {
      requireUser();
      calls.push(['listWorkouts', query]);
      const page = query.page || 1;
      const limit = query.limit || 10;
      let items = workouts.filter((item) => item.ownerId === currentUser.id);
      if (query.from) items = items.filter((item) => item.date >= query.from);
      if (query.to) items = items.filter((item) => item.date <= query.to);
      items = [...items].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
      const total = items.length;
      const start = (page - 1) * limit;
      return {
        workouts: items.slice(start, start + limit).map(toPublicWorkout),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    },
    createWorkout: async (body) => {
      requireUser();
      calls.push(['createWorkout', body]);
      if (failNextSave) {
        failNextSave = false;
        apiError('Could not save workout.');
      }
      const now = '2026-10-20T12:00:00.000Z';
      const workout = {
        id: String(nextId),
        ownerId: currentUser.id,
        date: body.date,
        title: body.title.trim(),
        notes: (body.notes || '').trim(),
        exercises: body.exercises,
        createdAt: now,
        updatedAt: now,
      };
      nextId += 1;
      workouts = [workout, ...workouts];
      return { workout: toPublicWorkout(workout) };
    },
    getWorkout: async (id) => {
      requireUser();
      calls.push(['getWorkout', id]);
      return { workout: toPublicWorkout(ownedWorkout(id)) };
    },
    updateWorkout: async (id, body) => {
      requireUser();
      calls.push(['updateWorkout', id, body]);
      if (failNextSave) {
        failNextSave = false;
        apiError('Could not save workout.');
      }
      const workout = ownedWorkout(id);
      workout.date = body.date;
      workout.title = body.title.trim();
      workout.notes = (body.notes || '').trim();
      workout.exercises = body.exercises;
      workout.updatedAt = '2026-10-20T12:30:00.000Z';
      return { workout: toPublicWorkout(workout) };
    },
    deleteWorkout: async (id) => {
      requireUser();
      calls.push(['deleteWorkout', id]);
      ownedWorkout(id);
      workouts = workouts.filter((item) => item.id !== id);
      return null;
    },
    listCalendar: async (query = {}) => {
      requireUser();
      calls.push(['listCalendar', query]);
      if (failCalendar) {
        failCalendar = false;
        apiError('Could not load calendar.');
      }
      if (!query.from || !query.to) {
        apiError('From date is required.', { status: 400, code: 'VALIDATION_ERROR' });
      }
      const ownedWorkouts = workouts.filter(
        (item) => item.ownerId === currentUser.id && item.date >= query.from && item.date <= query.to
      );
      const ownedSessions = sessions.filter(
        (item) => item.ownerId === currentUser.id && item.date >= query.from && item.date <= query.to
      );
      return {
        from: query.from,
        to: query.to,
        workouts: ownedWorkouts.map(toPublicWorkout),
        sessions: ownedSessions.map(toPublicSession),
      };
    },
    createSession: async (body) => {
      requireUser();
      calls.push(['createSession', body]);
      const session = {
        id: String(nextId),
        ownerId: currentUser.id,
        date: body.date,
        title: body.title.trim(),
        notes: (body.notes || '').trim(),
        startTime: body.startTime || '',
        createdAt: '2026-10-20T12:00:00.000Z',
        updatedAt: '2026-10-20T12:00:00.000Z',
      };
      nextId += 1;
      sessions = [session, ...sessions];
      return { session: toPublicSession(session) };
    },
    getSession: async (id) => {
      requireUser();
      const session = sessions.find((item) => item.id === id && item.ownerId === currentUser.id);
      if (!session) apiError('Gym session not found.', { status: 404, code: 'NOT_FOUND' });
      return { session: toPublicSession(session) };
    },
    updateSession: async (id, body) => {
      requireUser();
      const session = sessions.find((item) => item.id === id && item.ownerId === currentUser.id);
      if (!session) apiError('Gym session not found.', { status: 404, code: 'NOT_FOUND' });
      Object.assign(session, {
        date: body.date,
        title: body.title.trim(),
        notes: (body.notes || '').trim(),
        startTime: body.startTime || '',
      });
      return { session: toPublicSession(session) };
    },
    deleteSession: async (id) => {
      requireUser();
      sessions = sessions.filter((item) => !(item.id === id && item.ownerId === currentUser.id));
      return null;
    },
    listSessions: async (query = {}) => {
      requireUser();
      const ownedSessions = sessions.filter(
        (item) =>
          item.ownerId === currentUser.id &&
          (!query.from || item.date >= query.from) &&
          (!query.to || item.date <= query.to)
      );
      return { sessions: ownedSessions.map(toPublicSession) };
    },
    getProgress: async (query = {}) => {
      requireUser();
      calls.push(['getProgress', query]);
      if (failProgress) {
        failProgress = false;
        apiError('Could not load progress.');
      }
      const items = workouts.filter(
        (item) =>
          item.ownerId === currentUser.id &&
          (!query.from || item.date >= query.from) &&
          (!query.to || item.date <= query.to)
      );
      const exercises = [];
      const seen = new Set();
      for (const workout of items) {
        for (const exercise of workout.exercises || []) {
          const key = exercise.name.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          exercises.push(exercise.name);
        }
      }
      const points = [];
      if (query.exercise) {
        const target = query.exercise.toLowerCase();
        for (const workout of items) {
          let highest = null;
          for (const exercise of workout.exercises || []) {
            if (exercise.name.toLowerCase() !== target) continue;
            for (const set of exercise.sets || []) {
              if (highest === null || set.weightKg > highest) highest = set.weightKg;
            }
          }
          if (highest !== null) {
            points.push({
              date: workout.date,
              workoutId: workout.id,
              title: workout.title,
              highestWeightKg: highest,
            });
          }
        }
      }
      return {
        from: query.from,
        to: query.to,
        unit: 'kg',
        workoutsCompleted: items.length,
        exercises,
        exercise: query.exercise || '',
        points,
      };
    },
  };
}

export function renderWithAuth(ui, { client, route = '/', state } = {}) {
  const url = new URL(route, 'http://localhost');
  return (
    <MemoryRouter initialEntries={[{ pathname: url.pathname, search: url.search, state }]}>
      <AuthProvider client={client}>{ui}</AuthProvider>
    </MemoryRouter>
  );
}
