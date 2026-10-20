import mongoose from 'mongoose';
import { AppError, validationError } from '../utils/AppError.js';
import {
  DATE_PATTERN,
  EXERCISE_FIELDS,
  EXERCISE_MAX_COUNT,
  EXERCISE_NAME_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX_COUNT,
  SET_FIELDS,
  SET_WEIGHT_KG_MAX,
  SET_WEIGHT_KG_MIN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  WORKOUT_FIELDS,
  dateStringToUtc,
  isValidReps,
  isValidSetWeightKg,
  isValidWorkoutDate,
  trimText,
  unexpectedFields,
} from '../../../shared/workoutRules.js';

function rejectUnexpected(body, allowed, label = 'field') {
  const extra = unexpectedFields(body, allowed);
  if (extra.length > 0) {
    throw validationError(
      { _form: `Unexpected ${label}(s): ${extra.join(', ')}.` },
      'Unexpected fields are not allowed.'
    );
  }
}

export function parseWorkoutId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== id) {
    throw new AppError('That workout ID is not valid.', { status: 400, code: 'INVALID_ID' });
  }
  return id;
}

function parseSet(set, exerciseIndex, setIndex, details) {
  if (!set || typeof set !== 'object' || Array.isArray(set)) {
    details[`exercises.${exerciseIndex}.sets.${setIndex}`] = 'Each set must be an object.';
    return null;
  }
  rejectUnexpected(set, SET_FIELDS, 'set field');

  const prefix = `exercises.${exerciseIndex}.sets.${setIndex}`;
  if (set.reps === undefined || set.reps === null || set.reps === '') {
    details[`${prefix}.reps`] = 'Repetitions are required.';
  } else if (!isValidReps(set.reps)) {
    details[`${prefix}.reps`] = `Repetitions must be a whole number from ${REPS_MIN} to ${REPS_MAX}.`;
  }

  if (set.weightKg === undefined || set.weightKg === null || set.weightKg === '') {
    details[`${prefix}.weightKg`] = 'Weight is required. Use 0 kg for bodyweight sets.';
  } else if (!isValidSetWeightKg(set.weightKg)) {
    details[`${prefix}.weightKg`] =
      `Weight must be between ${SET_WEIGHT_KG_MIN} and ${SET_WEIGHT_KG_MAX} kg.`;
  }

  return {
    reps: Number(set.reps),
    weightKg: Number(set.weightKg),
  };
}

function parseExercise(exercise, index, details) {
  if (!exercise || typeof exercise !== 'object' || Array.isArray(exercise)) {
    details[`exercises.${index}`] = 'Each exercise must be an object.';
    return null;
  }
  rejectUnexpected(exercise, EXERCISE_FIELDS, 'exercise field');

  const name = trimText(exercise.name);
  if (!exercise.name || !name) {
    details[`exercises.${index}.name`] = 'Exercise name is required.';
  } else if (name.length > EXERCISE_NAME_MAX_LENGTH) {
    details[`exercises.${index}.name`] = `Exercise name must be at most ${EXERCISE_NAME_MAX_LENGTH} characters.`;
  }

  if (!Array.isArray(exercise.sets) || exercise.sets.length < 1) {
    details[`exercises.${index}.sets`] = 'Add at least one set.';
  } else if (exercise.sets.length > SETS_MAX_COUNT) {
    details[`exercises.${index}.sets`] = `An exercise can have at most ${SETS_MAX_COUNT} sets.`;
  }

  const sets = Array.isArray(exercise.sets)
    ? exercise.sets.map((set, setIndex) => parseSet(set, index, setIndex, details)).filter(Boolean)
    : [];

  return { name, sets };
}

export function parseWorkoutInput(body) {
  rejectUnexpected(body, WORKOUT_FIELDS);
  const details = {};

  const dateRaw = typeof body?.date === 'string' ? body.date.trim() : '';
  if (!dateRaw) details.date = 'Workout date is required.';
  else if (!isValidWorkoutDate(dateRaw)) details.date = 'Enter a valid date as YYYY-MM-DD.';

  const title = trimText(body?.title);
  if (!body?.title || !title) details.title = 'Workout title is required.';
  else if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    details.title = `Title must be ${TITLE_MIN_LENGTH}–${TITLE_MAX_LENGTH} characters.`;
  }

  let notes = '';
  if (body?.notes !== undefined && body?.notes !== null) {
    if (typeof body.notes !== 'string') details.notes = 'Notes must be text.';
    else {
      notes = body.notes.trim();
      if (notes.length > NOTES_MAX_LENGTH) {
        details.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters.`;
      }
    }
  }

  if (!Array.isArray(body?.exercises) || body.exercises.length < 1) {
    details.exercises = 'Add at least one exercise.';
  } else if (body.exercises.length > EXERCISE_MAX_COUNT) {
    details.exercises = `A workout can have at most ${EXERCISE_MAX_COUNT} exercises.`;
  }

  const exercises = Array.isArray(body?.exercises)
    ? body.exercises.map((exercise, index) => parseExercise(exercise, index, details)).filter(Boolean)
    : [];

  if (Object.keys(details).length > 0) throw validationError(details);

  return {
    date: dateStringToUtc(dateRaw),
    title,
    notes,
    exercises,
  };
}

export function parseListQuery(query) {
  const details = {};
  const fromRaw = typeof query.from === 'string' ? query.from.trim() : '';
  const toRaw = typeof query.to === 'string' ? query.to.trim() : '';

  if (fromRaw && !isValidWorkoutDate(fromRaw)) details.from = 'From date must be YYYY-MM-DD.';
  if (toRaw && !isValidWorkoutDate(toRaw)) details.to = 'To date must be YYYY-MM-DD.';
  if (fromRaw && toRaw && isValidWorkoutDate(fromRaw) && isValidWorkoutDate(toRaw) && fromRaw > toRaw) {
    details.to = 'To date must be on or after the from date.';
  }

  const page = query.page === undefined || query.page === '' ? 1 : Number(query.page);
  const limit =
    query.limit === undefined || query.limit === '' ? PAGE_SIZE_DEFAULT : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) details.page = 'Page must be a whole number of 1 or more.';
  if (!Number.isInteger(limit) || limit < 1 || limit > PAGE_SIZE_MAX) {
    details.limit = `Limit must be a whole number from 1 to ${PAGE_SIZE_MAX}.`;
  }

  const extra = Object.keys(query || {}).filter(
    (key) => !['from', 'to', 'page', 'limit'].includes(key)
  );
  if (extra.length > 0) {
    details._form = `Unexpected query field(s): ${extra.join(', ')}.`;
  }

  if (Object.keys(details).length > 0) throw validationError(details);

  const filter = {};
  if (fromRaw) filter.$gte = dateStringToUtc(fromRaw);
  if (toRaw) filter.$lte = dateStringToUtc(toRaw);

  return {
    dateFilter: Object.keys(filter).length > 0 ? filter : null,
    page,
    limit,
  };
}

export { DATE_PATTERN };
