import { AppError } from '../utils/AppError.js';

function duplicateField(error) {
  if (error.keyPattern) {
    return Object.keys(error.keyPattern)[0];
  }
  if (error.keyValue) {
    return Object.keys(error.keyValue)[0];
  }
  const match = String(error.message || '').match(/index:\s+(\w+)_/);
  return match ? match[1] : 'account';
}

export function notFound(_req, _res, next) {
  next(new AppError('Not found.', { status: 404, code: 'NOT_FOUND' }));
}

export function errorHandler(err, _req, res, _next) {
  if (err.code === 11000) {
    const field = duplicateField(err);
    const isEmail = field === 'email';
    const message = isEmail ? 'That email is already registered.' : 'That username is already taken.';
    res.status(409).json({
      error: {
        code: 'DUPLICATE',
        message,
        details: { [isEmail ? 'email' : 'username']: message },
      },
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const expose = status < 500;
  res.status(status).json({
    error: {
      code: err.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
      message: expose ? err.message : 'Something went wrong. Please try again.',
      details: expose ? err.details : undefined,
    },
  });
}
