import { Router } from 'express';
import { GymSession } from '../models/GymSession.js';
import { requireAuth, currentUserId } from '../middleware/auth.js';
import { parseCalendarQuery } from '../validators/calendar.js';
import { parseSessionId, parseSessionInput } from '../validators/session.js';
import { AppError } from '../utils/AppError.js';

async function findOwnedSession(req, id) {
  const session = await GymSession.findOne({ _id: id, owner: currentUserId(req) });
  if (!session) {
    throw new AppError('Gym session not found.', { status: 404, code: 'NOT_FOUND' });
  }
  return session;
}

export function createSessionRouter() {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { dateFilter } = parseCalendarQuery(req.query);
      const sessions = await GymSession.find({ owner: currentUserId(req), date: dateFilter }).sort({
        date: 1,
        startTime: 1,
        createdAt: 1,
      });
      res.json({ sessions: sessions.map((session) => session.toPublicJSON()) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const input = parseSessionInput(req.body);
      const session = await GymSession.create({
        ...input,
        owner: currentUserId(req),
      });
      res.status(201).json({ session: session.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const session = await findOwnedSession(req, parseSessionId(req.params.id));
      res.json({ session: session.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const input = parseSessionInput(req.body);
      const session = await findOwnedSession(req, parseSessionId(req.params.id));
      session.date = input.date;
      session.title = input.title;
      session.notes = input.notes;
      session.startTime = input.startTime;
      await session.save();
      res.json({ session: session.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const session = await findOwnedSession(req, parseSessionId(req.params.id));
      await session.deleteOne();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
