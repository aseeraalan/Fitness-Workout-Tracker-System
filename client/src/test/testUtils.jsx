import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';

export function createMockClient({ user = null, googleEnabled = false } = {}) {
  let currentUser = user;
  const calls = [];

  return {
    calls,
    loadCsrf: async () => 'csrf-test-token',
    getConfig: async () => ({
      googleEnabled,
      googleUnavailableMessage: googleEnabled
        ? null
        : 'Google sign-in is not configured. You can still register and log in with a username and password.',
    }),
    getMe: async () => {
      if (!currentUser) {
        const error = new Error('Please sign in to continue.');
        error.status = 401;
        error.payload = { message: error.message, code: 'UNAUTHENTICATED', details: {} };
        throw error;
      }
      return { user: currentUser };
    },
    register: async (body) => {
      calls.push(['register', body]);
      if (body.email === 'taken@example.com') {
        const error = new Error('That email is already registered.');
        error.payload = { message: error.message, code: 'DUPLICATE', details: { email: error.message } };
        throw error;
      }
      currentUser = {
        id: '1',
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        username: body.username.trim().toLowerCase(),
        authProvider: 'local',
        heightCm: null,
        weightKg: null,
        fitnessGoal: '',
      };
      return { user: currentUser };
    },
    login: async (body) => {
      calls.push(['login', body]);
      if (body.password !== 'Secure123') {
        const error = new Error('Invalid username/email or password.');
        error.payload = { message: error.message, code: 'INVALID_CREDENTIALS', details: {} };
        throw error;
      }
      currentUser = {
        id: '1',
        name: 'Alex Runner',
        email: 'alex@example.com',
        username: 'alexrunner',
        authProvider: 'local',
        heightCm: null,
        weightKg: null,
        fitnessGoal: '',
      };
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
  };
}

export function renderWithAuth(ui, { client, route = '/' } = {}) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider client={client}>{ui}</AuthProvider>
    </MemoryRouter>
  );
}
