import {
  FITNESS_GOAL_LABELS,
  FITNESS_GOALS,
  isValidEmail,
  isValidFitnessGoal,
  isValidHeightCm,
  isValidName,
  isValidPassword,
  isValidUsername,
  isValidWeightKg,
  PASSWORD_RULES_TEXT,
  USERNAME_RULES_TEXT,
} from '@shared/accountRules.js';

export { FITNESS_GOAL_LABELS, FITNESS_GOALS, PASSWORD_RULES_TEXT, USERNAME_RULES_TEXT };

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
  if (!isValidFitnessGoal(values.fitnessGoal)) errors.fitnessGoal = 'Choose a valid fitness goal.';
  return errors;
}
