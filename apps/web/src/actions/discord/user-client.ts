'use server';

import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { getSession } from '../session';

type CustomRequestConfig = {
  _noRetry: boolean;
} & AxiosRequestConfig;

type CustomError = {
  config: CustomRequestConfig;
} & AxiosError;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

export const api = axios.create({
  baseURL: 'https://discord.com/api/v10',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Dealbot (https://github.com/acdvs/dealbot)',
  },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (!session) redirect('/', RedirectType.replace);

  config.headers.set('Authorization', `Bearer ${session.access_token}`);
  return config;
});

api.interceptors.response.use(undefined, async (error: CustomError) => {
  const statusCode = error.response?.status;
  const noRetry = error.config?._noRetry;

  if (statusCode === 401 && !noRetry) {
    return await handleUnauthorized(error);
  } else if (statusCode === 429) {
    return await handleTooManyRequests(error);
  }

  return Promise.reject(error);
});

async function handleUnauthorized(error: CustomError) {
  const session = await getSession();
  error.config._noRetry = true;

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
      }
    );

    const cookieStore = await cookies();
    cookieStore.set(`session`, JSON.stringify(res.data), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 3,
      path: '/',
      secure: true,
    });

    return api(error.config);
  } catch {
    redirect('/session/logout', RedirectType.replace);
  }
}

async function handleTooManyRequests(error: CustomError) {
  const retryAfter = error.response?.headers['Retry-After'];

  if (retryAfter) {
    return await new Promise((res) =>
      setTimeout(() => res(api(error.config)), retryAfter)
    );
  }

  return;
}
