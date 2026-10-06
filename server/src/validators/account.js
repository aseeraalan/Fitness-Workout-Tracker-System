import {
  isValidEmail,
  isValidFitnessGoal,
  isValidHeightCm,
  isValidName,
  isValidPassword,
  isValidUsername,
  isValidWeightKg,
  normalizeEmail,
  normalizeUsername,
  trimText,
  unexpectedFields,
  USERNAME_RULES_TEXT,
  PASSWORD_RULES_TEXT,
  HEIGHT_CM_MIN,
  HEIGHT_CM_MAX,
  WEIGHT_KG_MIN,
  WEIGHT_KG_MAX,
} from '../../../shared/accountRules.js';
import { validationError } from '../utils/AppError.js';

const REGISTER_FIELDS = ['name', 'email', 'username', 'password', 'confirmPassword'];
const LOGIN_FIELDS = ['identifier', 'password'];
const PROFILE_FIELDS = ['name', 'username', 'heightCm', 'weightKg', 'fitnessGoal'];

function rejectUnexpected(body, allowed) {
  const extra = unexpectedFields(body, allowed);
  if (extra.length > 0) {
    throw validationError(
      { _form: `Unexpected field(s): ${extra.join(', ')}.` },
      'Unexpected fields are not allowed.'
    );
  }
}

export function parseRegisterInput(body) {
  rejectUnexpected(body, REGISTER_FIELDS);

  const name = trimText(body?.name);
  const email = normalizeEmail(body?.email);
  const username = normalizeUsername(body?.username);
  const password = typeof body?.password === 'string' ? body.password : '';
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

  const details = {};
  if (!body?.name) details.name = 'Name is required.';
  else if (!isValidName(name)) details.name = 'Name must be 2–80 characters.';

  if (!body?.email) details.email = 'Email is required.';
  else if (!isValidEmail(email)) details.email = 'Enter a valid email address.';

  if (!body?.username) details.username = 'Username is required.';
  else if (!isValidUsername(body.username.trim())) details.username = USERNAME_RULES_TEXT;

  if (typeof body?.password !== 'string' || body.password.length === 0) {
    details.password = 'Password is required.';
  } else if (!isValidPassword(password)) {
    details.password = PASSWORD_RULES_TEXT;
  }

  if (typeof body?.confirmPassword !== 'string' || body.confirmPassword.length === 0) {
    details.confirmPassword = 'Confirm your password.';
  } else if (password !== confirmPassword) {
    details.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(details).length > 0) throw validationError(details);

  return { name, email, username, password };
}

export function parseLoginInput(body) {
  rejectUnexpected(body, LOGIN_FIELDS);

  const identifierRaw = typeof body?.identifier === 'string' ? body.identifier : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const details = {};

  if (!identifierRaw.trim()) {
    details.identifier = 'Enter your username or email.';
  }
  if (!password) {
    details.password = 'Password is required.';
  }

  if (Object.keys(details).length > 0) throw validationError(details);

  const identifier = identifierRaw.includes('@')
    ? normalizeEmail(identifierRaw)
    : normalizeUsername(identifierRaw);

  return { identifier, password, looksLikeEmail: identifierRaw.includes('@') };
}

function parseOptionalNumber(value, field, label, isValid, rangeText) {
  if (value === null || value === undefined || value === '') return null;
  if (!isValid(value)) {
    return { error: `${label} must be ${rangeText}.` };
  }
  return { value: Number(value) };
}

export function parseProfileUpdateInput(body) {
  rejectUnexpected(body, PROFILE_FIELDS);
  const details = {};
  const update = {};

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    const name = trimText(body.name);
    if (!isValidName(name)) details.name = 'Name must be 2–80 characters.';
    else update.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'username')) {
    const raw = trimText(body.username);
    if (!isValidUsername(raw)) details.username = USERNAME_RULES_TEXT;
    else update.username = normalizeUsername(raw);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'heightCm')) {
    const parsed = parseOptionalNumber(
      body.heightCm,
      'heightCm',
      'Height',
      isValidHeightCm,
      `${HEIGHT_CM_MIN}–${HEIGHT_CM_MAX} cm`
    );
    if (parsed && parsed.error) details.heightCm = parsed.error;
    else update.heightCm = parsed ? parsed.value : null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'weightKg')) {
    const parsed = parseOptionalNumber(
      body.weightKg,
      'weightKg',
      'Weight',
      isValidWeightKg,
      `${WEIGHT_KG_MIN}–${WEIGHT_KG_MAX} kg`
    );
    if (parsed && parsed.error) details.weightKg = parsed.error;
    else update.weightKg = parsed ? parsed.value : null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'fitnessGoal')) {
    if (!isValidFitnessGoal(body.fitnessGoal)) {
      details.fitnessGoal = 'Choose a valid fitness goal.';
    } else {
      update.fitnessGoal = body.fitnessGoal || null;
    }
  }

  if (Object.keys(details).length > 0) throw validationError(details);
  if (Object.keys(update).length === 0) {
    throw validationError({ _form: 'No valid profile fields were provided.' });
  }

  return update;
}
