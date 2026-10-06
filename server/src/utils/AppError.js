export class AppError extends Error {
  constructor(message, { status = 400, code = 'BAD_REQUEST', details } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validationError(details, message = 'Please correct the highlighted fields.') {
  return new AppError(message, {
    status: 400,
    code: 'VALIDATION_ERROR',
    details,
  });
}
