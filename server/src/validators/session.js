import mongoose from 'mongoose';
import { AppError, validationError } from '../utils/AppError.js';
import {
  NOTES_MAX_LENGTH,
  SESSION_FIELDS,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  isValidStartTime,
  unexpectedFields,
} from '../../../shared/sessionRules.js';
import { dateStringToUtc, isValidWorkoutDate, trimText } from '../../../shared/workoutRules.js';

function rejectUnexpected(body, allowed, label = 'field') {
  const extra = unexpectedFields(body, allowed);
  if (extra.length > 0) {
    throw validationError(
      { _form: `Unexpected ${label}(s): ${extra.join(', ')}.` },
      'Unexpected fields are not allowed.'
    );
  }
}

export function parseSessionId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== id) {
    throw new AppError('That session ID is not valid.', { status: 400, code: 'INVALID_ID' });
  }
  return id;
}

export function parseSessionInput(body) {
  rejectUnexpected(body, SESSION_FIELDS);
  const details = {};

  const dateRaw = typeof body?.date === 'string' ? body.date.trim() : '';
  if (!dateRaw) details.date = 'Session date is required.';
  else if (!isValidWorkoutDate(dateRaw)) details.date = 'Enter a valid date as YYYY-MM-DD.';

  const title = trimText(body?.title);
  if (!body?.title || !title) details.title = 'Session title is required.';
  else if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    details.title = `Title must be ${TITLE_MIN_LENGTH}–${TITLE_MAX_LENGTH} characters.`;
  }

  let notes = '';
  if (body?.notes !== undefined && body?.notes !== null) {
    if (typeof body.notes !== 'string') details.notes = 'Notes must be text.';
    else {
      notes = body.notes.trim();
      if (notes.length > NOTES_MAX_LENGTH) {
        details.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters.`;
      }
    }
  }

  let startTime = '';
  if (body?.startTime !== undefined && body?.startTime !== null && body.startTime !== '') {
    if (!isValidStartTime(body.startTime)) {
      details.startTime = 'Start time must be HH:MM in 24-hour format.';
    } else {
      startTime = body.startTime;
    }
  }

  if (Object.keys(details).length > 0) throw validationError(details);

  return {
    date: dateStringToUtc(dateRaw),
    title,
    notes,
    startTime,
  };
}
