import {
  isValidEmail,
  isValidHeightCm,
  isValidName,
  isValidPassword,
  isValidUsername,
  isValidWeightKg,
  PASSWORD_RULES_TEXT,
  USERNAME_RULES_TEXT,
} from '@shared/accountRules.js';
import { isValidStartTime } from '@shared/sessionRules.js';
import { PROGRESS_MAX_RANGE_DAYS } from '@shared/calendarRules.js';
import {
  EXERCISE_MAX_COUNT,
  EXERCISE_NAME_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  REPS_MAX,
  REPS_MIN,
  SETS_MAX_COUNT,
  SET_WEIGHT_KG_MAX,
  SET_WEIGHT_KG_MIN,
  TITLE_MAX_LENGTH,
  daysInclusive,
  isValidReps,
  isValidSetWeightKg,
  isValidWorkoutDate,
} from '@shared/workoutRules.js';

export { PASSWORD_RULES_TEXT, USERNAME_RULES_TEXT };

export function validateRegister(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  else if (!isValidName(values.name)) errors.name = 'Name must be 2–80 characters.';

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email.trim().toLowerCase())) errors.email = 'Enter a valid email address.';

  if (!values.username.trim()) errors.username = 'Username is required.';
  else if (!isValidUsername(values.username.trim())) errors.username = USERNAME_RULES_TEXT;

  if (!values.password) errors.password = 'Password is required.';
  else if (!isValidPassword(values.password)) errors.password = PASSWORD_RULES_TEXT;

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function validateLogin(values) {
  const errors = {};
  if (!values.identifier.trim()) errors.identifier = 'Enter your username or email.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

export function validateProfile(values) {
  const errors = {};
  if (!isValidName(values.name)) errors.name = 'Name must be 2–80 characters.';
  if (!isValidUsername(values.username.trim())) errors.username = USERNAME_RULES_TEXT;
  if (!isValidHeightCm(values.heightCm)) errors.heightCm = 'Height must be 50–250 cm.';
  if (!isValidWeightKg(values.weightKg)) errors.weightKg = 'Weight must be 20–400 kg.';
  return errors;
}

export function validateWorkout(values) {
  const errors = {};
  if (!values.date) errors.date = 'Workout date is required.';
  else if (!isValidWorkoutDate(values.date)) errors.date = 'Enter a valid date as YYYY-MM-DD.';

  const title = values.title?.trim() || '';
  if (!title) errors.title = 'Workout title is required.';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be at most ${TITLE_MAX_LENGTH} characters.`;
  }

  const notes = values.notes?.trim() || '';
  if (notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters.`;
  }

  if (!Array.isArray(values.exercises) || values.exercises.length < 1) {
    errors.exercises = 'Add at least one exercise.';
  } else if (values.exercises.length > EXERCISE_MAX_COUNT) {
    errors.exercises = `A workout can have at most ${EXERCISE_MAX_COUNT} exercises.`;
  }

  (values.exercises || []).forEach((exercise, index) => {
    const name = exercise.name?.trim() || '';
    if (!name) errors[`exercises.${index}.name`] = 'Exercise name is required.';
    else if (name.length > EXERCISE_NAME_MAX_LENGTH) {
      errors[`exercises.${index}.name`] = `Exercise name must be at most ${EXERCISE_NAME_MAX_LENGTH} characters.`;
    }

    if (!Array.isArray(exercise.sets) || exercise.sets.length < 1) {
      errors[`exercises.${index}.sets`] = 'Add at least one set.';
    } else if (exercise.sets.length > SETS_MAX_COUNT) {
      errors[`exercises.${index}.sets`] = `An exercise can have at most ${SETS_MAX_COUNT} sets.`;
    }

    (exercise.sets || []).forEach((set, setIndex) => {
      const prefix = `exercises.${index}.sets.${setIndex}`;
      if (set.reps === '' || set.reps === undefined || set.reps === null) {
        errors[`${prefix}.reps`] = 'Repetitions are required.';
      } else if (!isValidReps(set.reps)) {
        errors[`${prefix}.reps`] = `Repetitions must be a whole number from ${REPS_MIN} to ${REPS_MAX}.`;
      }

      if (set.weightKg === '' || set.weightKg === undefined || set.weightKg === null) {
        errors[`${prefix}.weightKg`] = 'Weight is required. Use 0 kg for bodyweight sets.';
      } else if (!isValidSetWeightKg(set.weightKg)) {
        errors[`${prefix}.weightKg`] =
          `Weight must be between ${SET_WEIGHT_KG_MIN} and ${SET_WEIGHT_KG_MAX} kg.`;
      }
    });
  });

  return errors;
}

export function validateSession(values) {
  const errors = {};
  if (!values.date) errors.date = 'Session date is required.';
  else if (!isValidWorkoutDate(values.date)) errors.date = 'Enter a valid date as YYYY-MM-DD.';

  const title = values.title?.trim() || '';
  if (!title) errors.title = 'Session title is required.';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be at most ${TITLE_MAX_LENGTH} characters.`;
  }

  const notes = values.notes?.trim() || '';
  if (notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters.`;
  }

  if (values.startTime && !isValidStartTime(values.startTime)) {
    errors.startTime = 'Start time must be HH:MM in 24-hour format.';
  }
  return errors;
}

export function validateWorkoutFilters(values) {
  const errors = {};
  if (values.from && !isValidWorkoutDate(values.from)) errors.from = 'From date must be YYYY-MM-DD.';
  if (values.to && !isValidWorkoutDate(values.to)) errors.to = 'To date must be YYYY-MM-DD.';
  if (values.from && values.to && isValidWorkoutDate(values.from) && isValidWorkoutDate(values.to) && values.from > values.to) {
    errors.to = 'To date must be on or after the from date.';
  }
  return errors;
}

export function validateProgressFilters(values) {
  const errors = validateWorkoutFilters(values);
  if (!values.from) errors.from = 'From date is required.';
  if (!values.to) errors.to = 'To date is required.';
  if (
    !errors.from &&
    !errors.to &&
    values.from &&
    values.to &&
    daysInclusive(values.from, values.to) > PROGRESS_MAX_RANGE_DAYS
  ) {
    errors.to = `Date range cannot exceed ${PROGRESS_MAX_RANGE_DAYS} days.`;
  }
  return errors;
}

export function workoutToForm(workout) {
  return {
    date: workout.date,
    title: workout.title,
    notes: workout.notes || '',
    exercises: (workout.exercises || []).map((exercise) => ({
      name: exercise.name,
      sets: (exercise.sets || []).map((set) => ({
        reps: String(set.reps),
        weightKg: String(set.weightKg),
      })),
    })),
  };
}

export function formToWorkoutPayload(values) {
  return {
    date: values.date,
    title: values.title,
    notes: values.notes,
    exercises: values.exercises.map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets.map((set) => ({
        reps: set.reps === '' ? '' : Number(set.reps),
        weightKg: set.weightKg === '' ? '' : Number(set.weightKg),
      })),
    })),
  };
}

export function formatWorkoutDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
