type OpenAPIError = {
  status_code: number;
  reason_phrase: string;
};

export class APIError {
  statusCode: number;
  message: string;
  path: string;

  constructor(error: OpenAPIError, path: string) {
    this.statusCode = error.status_code;
    this.message = error.reason_phrase;
    this.path = path;
  }
}
