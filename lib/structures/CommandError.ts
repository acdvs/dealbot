export default class CommandError extends Error {
  message = 'Something went wrong. Please try again later.';
  code: CommandErrorCode;
  details?: string;

  constructor(code: CommandErrorCode, details?: string) {
    super();

    this.code = code;
    this.details = details;
  }
}

export enum CommandErrorCode {
  RUNTIME_ERR,
  TIMED_OUT,
  NO_DATA,
}
