'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

type Session = {
  token_type: 'Bearer';
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
};

export async function getSession() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('session')?.value;

  if (!sessionStr) return;

  try {
    return JSON.parse(sessionStr) as Session;
  } catch {
    return;
  }
}

export async function deleteSession() {
  const session = await getSession();

  if (!session) {
    return;
  }

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
    }
  );

  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function checkSessionId() {
  const cookieStore = await cookies();
  let sid = cookieStore.get('sid')?.value;

  if (!sid) {
    sid = uuidv4();
    cookieStore.set('sid', sid, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1,
      path: '/',
      secure: true,
    });
  }

  return sid;
}
