import rateLimit from 'express-rate-limit';

export function createAuthLimiter({ enabled }) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !enabled,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many authentication attempts. Please wait and try again.',
        },
      });
    },
  });
}
