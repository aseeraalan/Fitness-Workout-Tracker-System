import { AppError } from '../utils/AppError.js';
import { createCsrfToken } from '../utils/session.js';

export function ensureCsrfToken(req, _res, next) {
  if (!req.session) {
    next();
    return;
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = createCsrfToken();
  }
  next();
}

export function requireCsrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const path = req.path || '';
  if (path.startsWith('/api/auth/google') && !path.includes('/mock')) {
    next();
    return;
  }

  const headerToken = req.get('x-csrf-token');
  if (!headerToken || !req.session?.csrfToken || headerToken !== req.session.csrfToken) {
    next(
      new AppError('Invalid or missing CSRF token. Refresh the page and try again.', {
        status: 403,
        code: 'CSRF',
      })
    );
    return;
  }
  next();
}
