import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH, unexpectedFields } from './workoutRules.js';

export const SESSION_FIELDS = ['date', 'title', 'notes', 'startTime'];
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidStartTime(value) {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

export function emptySessionForm(date = '') {
  return {
    date,
    title: '',
    notes: '',
    startTime: '',
  };
}

export { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH, unexpectedFields };
