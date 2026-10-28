import { validationError } from '../utils/AppError.js';
import {
  CALENDAR_MAX_RANGE_DAYS,
  CALENDAR_QUERY_FIELDS,
  PROGRESS_MAX_RANGE_DAYS,
  PROGRESS_QUERY_FIELDS,
  daysInclusive,
  isValidWorkoutDate,
  unexpectedFields,
} from '../../../shared/calendarRules.js';
import { EXERCISE_NAME_MAX_LENGTH, dateStringToUtc, trimText } from '../../../shared/workoutRules.js';

function parseRequiredRange(query, maxDays, allowedFields) {
  const details = {};
  const extra = unexpectedFields(query, allowedFields);
  if (extra.length > 0) details._form = `Unexpected query field(s): ${extra.join(', ')}.`;

  const fromRaw = typeof query.from === 'string' ? query.from.trim() : '';
  const toRaw = typeof query.to === 'string' ? query.to.trim() : '';

  if (!fromRaw) details.from = 'From date is required.';
  else if (!isValidWorkoutDate(fromRaw)) details.from = 'From date must be YYYY-MM-DD.';

  if (!toRaw) details.to = 'To date is required.';
  else if (!isValidWorkoutDate(toRaw)) details.to = 'To date must be YYYY-MM-DD.';

  if (fromRaw && toRaw && isValidWorkoutDate(fromRaw) && isValidWorkoutDate(toRaw)) {
    if (fromRaw > toRaw) details.to = 'To date must be on or after the from date.';
    else if (daysInclusive(fromRaw, toRaw) > maxDays) {
      details.to = `Date range cannot exceed ${maxDays} days.`;
    }
  }

  return { details, fromRaw, toRaw };
}

export function parseCalendarQuery(query) {
  const { details, fromRaw, toRaw } = parseRequiredRange(query, CALENDAR_MAX_RANGE_DAYS, CALENDAR_QUERY_FIELDS);
  if (Object.keys(details).length > 0) throw validationError(details);
  return {
    from: fromRaw,
    to: toRaw,
    dateFilter: { $gte: dateStringToUtc(fromRaw), $lte: dateStringToUtc(toRaw) },
  };
}

export function parseProgressQuery(query) {
  const { details, fromRaw, toRaw } = parseRequiredRange(query, PROGRESS_MAX_RANGE_DAYS, PROGRESS_QUERY_FIELDS);

  let exercise = '';
  if (query.exercise !== undefined && query.exercise !== '') {
    if (typeof query.exercise !== 'string') details.exercise = 'Exercise must be text.';
    else {
      exercise = trimText(query.exercise);
      if (!exercise) details.exercise = 'Exercise name is required when provided.';
      else if (exercise.length > EXERCISE_NAME_MAX_LENGTH) {
        details.exercise = `Exercise name must be at most ${EXERCISE_NAME_MAX_LENGTH} characters.`;
      }
    }
  }

  if (Object.keys(details).length > 0) throw validationError(details);
  return {
    from: fromRaw,
    to: toRaw,
    exercise,
    dateFilter: { $gte: dateStringToUtc(fromRaw), $lte: dateStringToUtc(toRaw) },
  };
}
