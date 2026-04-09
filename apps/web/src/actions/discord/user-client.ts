'use server';

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';
import { getSession, logout } from '../session';

type CustomRequestConfig = {
  _retries: number;
  _noRetry: boolean;
} & AxiosRequestConfig;

type CustomError = {
  config: CustomRequestConfig;
} & AxiosError;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET as string;

const MAX_RETRIES = 3;
const RETRY_DELAY_THRESHOLD_SEC = 3;

export const api = axios.create({
  baseURL: 'https://discord.com/api/v10',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Dealbot (https://github.com/acdvs/dealbot)',
  },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (!session) {
    redirect('/', RedirectType.replace);
  }

  config.headers.set('Authorization', `Bearer ${session.access_token}`);
  return config;
});

api.interceptors.response.use(null, async (error: CustomError) => {
  const statusCode = error.response?.status;
  error.config._retries = error.config._retries ?? MAX_RETRIES;

  if (statusCode === 401) {
    return await handleUnauthorized(error);
  } else if (statusCode === 429) {
    return await handleTooManyRequests(error);
  }

  throw error;
});

function retry(
  config: CustomRequestConfig,
  delay?: number,
): Promise<AxiosResponse<unknown>> {
  if (config._retries === 0) {
    throw 'Out of retries';
  }

  config._retries--;

  if (delay && delay > 0) {
    return new Promise((res) => setTimeout(() => res(api(config)), delay));
  }

  return api(config);
}

async function handleUnauthorized(error: CustomError) {
  const session = await getSession();

  if (!session) {
    redirect('/', RedirectType.replace);
  }

  try {
    const res = await axios.post(
      'https://discord.com/api/oauth2/token',
      {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: session.refresh_token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const cookieStore = await cookies();
    cookieStore.set(`session`, JSON.stringify(res.data), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 3,
      path: '/',
      secure: true,
    });

    return retry(error.config);
  } catch {
    logout();
  }
}

function handleTooManyRequests(error: CustomError) {
  const retryAfterSec = Number(error.response?.headers['retry-after']);

  if (retryAfterSec && retryAfterSec < RETRY_DELAY_THRESHOLD_SEC) {
    const retryAfterMs = retryAfterSec * 1000;
    return retry(error.config, retryAfterMs);
  }

  throw 'Retry threshold too high';
}
