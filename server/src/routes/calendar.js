import { Router } from 'express';
import { Workout } from '../models/Workout.js';
import { GymSession } from '../models/GymSession.js';
import { requireAuth, currentUserId } from '../middleware/auth.js';
import { parseCalendarQuery } from '../validators/calendar.js';

export function createCalendarRouter() {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { from, to, dateFilter } = parseCalendarQuery(req.query);
      const owner = currentUserId(req);
      const [workouts, sessions] = await Promise.all([
        Workout.find({ owner, date: dateFilter }).sort({ date: 1, createdAt: 1 }),
        GymSession.find({ owner, date: dateFilter }).sort({ date: 1, startTime: 1, createdAt: 1 }),
      ]);

      res.json({
        from,
        to,
        workouts: workouts.map((workout) => workout.toPublicJSON()),
        sessions: sessions.map((session) => session.toPublicJSON()),
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
