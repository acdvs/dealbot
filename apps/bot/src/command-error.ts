type ErrorCode = 'RUNTIME_ERR' | 'TIMED_OUT' | 'NO_DATA' | 'IMPORT_ERR';

const errorMessages: Record<ErrorCode, string> = {
  IMPORT_ERR: '',
  NO_DATA: 'No data found.',
  RUNTIME_ERR: 'Something went wrong. Please try again later.',
  TIMED_OUT: 'Command took too long.',
};

export class CommandError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, details?: any) {
    super();

    this.code = code;
    this.cause = details;
    this.message = errorMessages[code];
  }
}
