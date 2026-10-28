import {
  DATE_PATTERN,
  daysInclusive,
  isValidWorkoutDate,
  unexpectedFields,
} from './workoutRules.js';

export const CALENDAR_MAX_RANGE_DAYS = 45;
export const PROGRESS_MAX_RANGE_DAYS = 366;
export const CALENDAR_QUERY_FIELDS = ['from', 'to'];
export const PROGRESS_QUERY_FIELDS = ['from', 'to', 'exercise'];

export { DATE_PATTERN, daysInclusive, isValidWorkoutDate, unexpectedFields };
