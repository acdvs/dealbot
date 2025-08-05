import { Middleware } from 'openapi-fetch';
import { APIError, OpenAPIError } from './error';

const middleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const data = await response.clone().json();
      const body = data.body as OpenAPIError;
      throw new APIError(body, response.url);
    }
  },
};

export default middleware;
