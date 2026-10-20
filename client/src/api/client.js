const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export function parseApiError(data, fallback = 'Something went wrong. Please try again.') {
  return {
    message: data?.error?.message || fallback,
    code: data?.error?.code,
    details: data?.error?.details || {},
  };
}

export function createApiClient({ onUnauthorized } = {}) {
  let csrfToken = '';
  let csrfPromise = null;

  function rememberCsrf(data) {
    if (data?.csrfToken) csrfToken = data.csrfToken;
    return data;
  }

  async function loadCsrf() {
    if (!csrfPromise) {
      csrfPromise = fetch(apiUrl('/api/auth/csrf-token'), { credentials: 'include' })
        .then(async (response) => {
          const data = await response.json();
          csrfToken = data.csrfToken || '';
          return csrfToken;
        })
        .finally(() => {
          csrfPromise = null;
        });
    }
    return csrfPromise;
  }

  async function request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      await loadCsrf();
    }

    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(apiUrl(path), {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && onUnauthorized) onUnauthorized();
      const error = new Error(parseApiError(data).message);
      error.status = response.status;
      error.payload = parseApiError(data);
      throw error;
    }
    return rememberCsrf(data);
  }

  return {
    apiUrl,
    loadCsrf,
    getCsrfToken: () => csrfToken,
    getConfig: () => request('/api/auth/config'),
    getMe: () => request('/api/auth/me'),
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    async logout() {
      await request('/api/auth/logout', { method: 'POST' });
      csrfToken = '';
    },
    getProfile: () => request('/api/profile'),
    updateProfile: (body) => request('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    googleStartUrl: () => apiUrl('/api/auth/google'),
    listWorkouts: (query = {}) => request(`/api/workouts${workoutQueryString(query)}`),
    createWorkout: (body) => request('/api/workouts', { method: 'POST', body: JSON.stringify(body) }),
    getWorkout: (id) => request(`/api/workouts/${id}`),
    updateWorkout: (id, body) =>
      request(`/api/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteWorkout: (id) => request(`/api/workouts/${id}`, { method: 'DELETE' }),
  };
}

function workoutQueryString(query = {}) {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const api = createApiClient();
