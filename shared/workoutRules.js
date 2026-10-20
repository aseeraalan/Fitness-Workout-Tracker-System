import { unexpectedFields, trimText } from './accountRules.js';

export const TITLE_MIN_LENGTH = 1;
export const TITLE_MAX_LENGTH = 80;
export const NOTES_MAX_LENGTH = 1000;
export const EXERCISE_NAME_MAX_LENGTH = 80;
export const EXERCISE_MAX_COUNT = 20;
export const SETS_MAX_COUNT = 20;
export const REPS_MIN = 1;
export const REPS_MAX = 500;
export const SET_WEIGHT_KG_MIN = 0;
export const SET_WEIGHT_KG_MAX = 1000;
export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZE_MAX = 50;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const WORKOUT_FIELDS = ['date', 'title', 'notes', 'exercises'];
export const EXERCISE_FIELDS = ['name', 'sets'];
export const SET_FIELDS = ['reps', 'weightKg'];

export function isValidWorkoutDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function dateStringToUtc(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function utcToDateString(value) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateString() {
  return utcToDateString(new Date());
}

export function isValidReps(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= REPS_MIN && number <= REPS_MAX;
}

export function isValidSetWeightKg(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= SET_WEIGHT_KG_MIN && number <= SET_WEIGHT_KG_MAX;
}

export function emptyWorkoutForm() {
  return {
    date: todayDateString(),
    title: '',
    notes: '',
    exercises: [{ name: '', sets: [{ reps: '', weightKg: '' }] }],
  };
}

export function emptyExercise() {
  return { name: '', sets: [{ reps: '', weightKg: '' }] };
}

export function emptySet() {
  return { reps: '', weightKg: '' };
}

export { unexpectedFields, trimText };
