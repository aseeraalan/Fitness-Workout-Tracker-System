import { Router } from 'express';
import { Workout } from '../models/Workout.js';
import { requireAuth, currentUserId } from '../middleware/auth.js';
import { parseListQuery, parseWorkoutId, parseWorkoutInput } from '../validators/workout.js';
import { AppError } from '../utils/AppError.js';

async function findOwnedWorkout(req, id) {
  const workout = await Workout.findOne({ _id: id, owner: currentUserId(req) });
  if (!workout) {
    throw new AppError('Workout not found.', { status: 404, code: 'NOT_FOUND' });
  }
  return workout;
}

export function createWorkoutRouter() {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { dateFilter, page, limit } = parseListQuery(req.query);
      const owner = currentUserId(req);
      const filter = { owner };
      if (dateFilter) filter.date = dateFilter;

      const total = await Workout.countDocuments(filter);
      const workouts = await Workout.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        workouts: workouts.map((workout) => workout.toPublicJSON()),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const input = parseWorkoutInput(req.body);
      const workout = await Workout.create({
        ...input,
        owner: currentUserId(req),
      });
      res.status(201).json({ workout: workout.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = parseWorkoutId(req.params.id);
      const workout = await findOwnedWorkout(req, id);
      res.json({ workout: workout.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const id = parseWorkoutId(req.params.id);
      const input = parseWorkoutInput(req.body);
      const workout = await findOwnedWorkout(req, id);
      workout.date = input.date;
      workout.title = input.title;
      workout.notes = input.notes;
      workout.exercises = input.exercises;
      await workout.save();
      res.json({ workout: workout.toPublicJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = parseWorkoutId(req.params.id);
      const workout = await findOwnedWorkout(req, id);
      await workout.deleteOne();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
