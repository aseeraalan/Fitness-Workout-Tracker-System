import { Router } from 'express';
import { User } from '../models/User.js';
import { requireAuth, currentUserId } from '../middleware/auth.js';
import { parseProfileUpdateInput } from '../validators/account.js';
import { AppError } from '../utils/AppError.js';

export function createProfileRouter() {
  const router = Router();

  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const user = await User.findById(currentUserId(req));
      if (!user) {
        throw new AppError('Please sign in to continue.', {
          status: 401,
          code: 'UNAUTHENTICATED',
        });
      }
      res.json({ user: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/', async (req, res, next) => {
    try {
      const update = parseProfileUpdateInput(req.body);
      const user = await User.findById(currentUserId(req));
      if (!user) {
        throw new AppError('Please sign in to continue.', {
          status: 401,
          code: 'UNAUTHENTICATED',
        });
      }

      Object.assign(user, update);
      await user.save();
      res.json({ user: user.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
