import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { normalizeEmail, normalizeUsername, trimText } from '../../../shared/accountRules.js';

function googleUsernameSeed(email, displayName) {
  const fromEmail = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  const fromName = trimText(displayName).replace(/[^a-zA-Z0-9_]/g, '');
  const seed = (fromEmail || fromName || 'user').toLowerCase();
  const withLetter = /^[a-zA-Z]/.test(seed) ? seed : `u${seed}`;
  return withLetter.slice(0, 20);
}

async function uniqueUsernameFromSeed(seed) {
  let candidate = seed;
  let suffix = 0;
  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${seed}${suffix}`.slice(0, 30);
  }
  return candidate;
}

export async function findOrCreateGoogleUser(profile) {
  const googleId = profile?.id ? String(profile.id) : '';
  if (!googleId) {
    throw new AppError('Google sign-in failed because Google did not provide a user identifier.', {
      status: 401,
      code: 'GOOGLE_AUTH_FAILED',
    });
  }

  const existingGoogleUser = await User.findOne({ googleId });
  if (existingGoogleUser) {
    return existingGoogleUser;
  }

  const rawEmail = profile?.emails?.[0]?.value;
  const email = normalizeEmail(rawEmail);
  if (!email) {
    throw new AppError('Google sign-in failed because Google did not provide an email address.', {
      status: 401,
      code: 'GOOGLE_AUTH_FAILED',
    });
  }

  const emailOwner = await User.findOne({ email });
  if (emailOwner) {
    throw new AppError(
      'An account with this email already exists. Sign in with your username and password instead of Google. Accounts are not linked automatically.',
      { status: 409, code: 'ACCOUNT_LINKING_REQUIRED' }
    );
  }

  const name = trimText(profile.displayName) || 'Google User';
  const username = await uniqueUsernameFromSeed(googleUsernameSeed(email, profile.displayName));

  return User.create({
    name,
    email,
    username: normalizeUsername(username),
    authProvider: 'google',
    googleId,
  });
}
