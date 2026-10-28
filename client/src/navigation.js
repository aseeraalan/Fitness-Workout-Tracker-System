export function safeInternalPath(value, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }
  return value;
}

export function withReturnTo(path, returnTo) {
  if (!returnTo) return path;
  const safe = safeInternalPath(returnTo, '');
  if (!safe) return path;
  const join = path.includes('?') ? '&' : '?';
  return `${path}${join}returnTo=${encodeURIComponent(safe)}`;
}

export function calendarPath(dateString) {
  return dateString ? `/calendar?date=${dateString}` : '/calendar';
}

export function newWorkoutPath(dateString, returnTo) {
  const params = new URLSearchParams();
  if (dateString) params.set('date', dateString);
  if (returnTo) params.set('returnTo', returnTo);
  const query = params.toString();
  return query ? `/workouts/new?${query}` : '/workouts/new';
}

export function newSessionPath(dateString, returnTo) {
  const params = new URLSearchParams();
  if (dateString) params.set('date', dateString);
  if (returnTo) params.set('returnTo', returnTo);
  const query = params.toString();
  return query ? `/sessions/new?${query}` : '/sessions/new';
}
