type ErrorCode = 'RUNTIME_ERR' | 'TIMED_OUT' | 'NO_DATA';

export class CommandError extends Error {
  readonly message = 'Something went wrong. Please try again later.';
  readonly code: ErrorCode;
  readonly details?: string;

  constructor(code: ErrorCode, details?: string) {
    super();
    this.code = code;
    this.details = details;
  }
}
