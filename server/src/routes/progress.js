import { Router } from 'express';
import { Workout } from '../models/Workout.js';
import { requireAuth, currentUserId } from '../middleware/auth.js';
import { parseProgressQuery } from '../validators/calendar.js';
import { utcToDateString } from '../../../shared/workoutRules.js';

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function highestWeightKg(workout, exerciseName) {
  const target = normalizeName(exerciseName);
  let highest = null;
  for (const exercise of workout.exercises || []) {
    if (normalizeName(exercise.name) !== target) continue;
    for (const set of exercise.sets || []) {
      const weight = Number(set.weightKg);
      if (!Number.isFinite(weight)) continue;
      if (highest === null || weight > highest) highest = weight;
    }
  }
  return highest;
}

export function createProgressRouter() {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { from, to, exercise, dateFilter } = parseProgressQuery(req.query);
      const workouts = await Workout.find({ owner: currentUserId(req), date: dateFilter }).sort({
        date: 1,
        createdAt: 1,
      });

      const exerciseNames = [];
      const seen = new Set();
      for (const workout of workouts) {
        for (const item of workout.exercises || []) {
          const key = normalizeName(item.name);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          exerciseNames.push(item.name);
        }
      }

      const points = [];
      if (exercise) {
        for (const workout of workouts) {
          const highestWeightKgValue = highestWeightKg(workout, exercise);
          if (highestWeightKgValue === null) continue;
          points.push({
            date: utcToDateString(workout.date),
            workoutId: workout._id.toString(),
            title: workout.title,
            highestWeightKg: highestWeightKgValue,
          });
        }
      }

      res.json({
        from,
        to,
        unit: 'kg',
        workoutsCompleted: workouts.length,
        exercises: exerciseNames,
        exercise: exercise || '',
        points,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
