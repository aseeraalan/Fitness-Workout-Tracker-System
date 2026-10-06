export const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;
export const USERNAME_RULES_TEXT =
  'Usernames must be 3–30 characters, start with a letter, and contain only letters, numbers, and underscores.';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
export const PASSWORD_RULES_TEXT =
  'Passwords must be 8–128 characters and include at least one letter and one number. Passwords are never trimmed.';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;

export const HEIGHT_CM_MIN = 50;
export const HEIGHT_CM_MAX = 250;
export const WEIGHT_KG_MIN = 20;
export const WEIGHT_KG_MAX = 400;

export const FITNESS_GOALS = [
  'lose_weight',
  'build_muscle',
  'improve_endurance',
  'stay_active',
  'other',
];

export const FITNESS_GOAL_LABELS = {
  lose_weight: 'Lose weight',
  build_muscle: 'Build muscle',
  improve_endurance: 'Improve endurance',
  stay_active: 'Stay active',
  other: 'Other',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function trimText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function normalizeEmail(value) {
  return trimText(value).toLowerCase();
}

export function normalizeUsername(value) {
  return trimText(value).toLowerCase();
}

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function isValidUsername(username) {
  return typeof username === 'string' && USERNAME_PATTERN.test(username);
}

export function isValidPassword(password) {
  return typeof password === 'string' && PASSWORD_PATTERN.test(password);
}

export function isValidName(name) {
  const trimmed = trimText(name);
  return trimmed.length >= NAME_MIN_LENGTH && trimmed.length <= NAME_MAX_LENGTH;
}

export function isBlankOptional(value) {
  return value === null || value === undefined || value === '';
}

export function isValidHeightCm(value) {
  if (isBlankOptional(value)) return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= HEIGHT_CM_MIN && number <= HEIGHT_CM_MAX;
}

export function isValidWeightKg(value) {
  if (isBlankOptional(value)) return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= WEIGHT_KG_MIN && number <= WEIGHT_KG_MAX;
}

export function isValidFitnessGoal(value) {
  if (isBlankOptional(value)) return true;
  return FITNESS_GOALS.includes(value);
}

export function unexpectedFields(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['body'];
  }
  return Object.keys(body).filter((key) => !allowed.includes(key));
}
