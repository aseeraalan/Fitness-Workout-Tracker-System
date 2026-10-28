import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

function asMongoObjectId(value) {
  if (value === undefined || value === null || value === '') return null;
  const asString = String(value);
  if (!mongoose.Types.ObjectId.isValid(asString) || String(new mongoose.Types.ObjectId(asString)) !== asString) {
    return null;
  }
  return asString;
}

export function mongoUserId(user) {
  if (!user) return null;
  return asMongoObjectId(user._id) || asMongoObjectId(user.id);
}

export function requireAuth(req, _res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && mongoUserId(req.user)) {
    next();
    return;
  }
  next(
    new AppError('Please sign in to continue.', {
      status: 401,
      code: 'UNAUTHENTICATED',
    })
  );
}

export function currentUserId(req) {
  return mongoUserId(req.user);
}
