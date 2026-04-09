'use server';

import crypto from 'node:crypto';
import axios from 'axios';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET as string;

type Session = {
  token_type: 'Bearer';
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
};

export async function logout(): Promise<never> {
  await deleteSession();
  redirect('/', RedirectType.replace);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('session')?.value;

  if (!sessionStr) {
    return;
  }

  try {
    const session = JSON.parse(sessionStr) as Session;
    return session;
  } catch {}
}

export async function deleteSession() {
  const session = await getSession();

  if (!session) {
    return false;
  }

  try {
    await axios.post(
      'https://discord.com/api/oauth2/token/revoke',
      {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        token: session.access_token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Dealbot (https://github.com/acdvs/dealbot)',
        },
      },
    );

    const cookieStore = await cookies();
    cookieStore.delete('session');

    return true;
  } catch {
    return false;
  }
}

export async function checkSessionId() {
  const cookieStore = await cookies();
  let sid = cookieStore.get('sid')?.value;

  if (!sid) {
    sid = crypto.randomUUID();
    cookieStore.set('sid', sid, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1,
      path: '/',
      secure: true,
    });
  }

  return sid;
}
