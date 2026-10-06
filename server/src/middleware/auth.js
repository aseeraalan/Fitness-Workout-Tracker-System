import { AppError } from '../utils/AppError.js';

export function requireAuth(req, _res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    next();
    return;
  }
  next(
    new AppError('Please sign in to continue.', {
      status: 401,
      code: 'UNAUTHENTICATED',
    })
  );
}

export function currentUserId(req) {
  return req.user?._id || req.user?.id;
}
