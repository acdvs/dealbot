import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  const cookieStore = await cookies();
  const sid = cookieStore.get('sid')?.value;

  if (!code || state !== sid) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  try {
    const res = await axios.post(
      'https://discord.com/api/oauth2/token',
      {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/oauth/token`,
        scope: 'identify guilds',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cookieStore.set(`session`, JSON.stringify(res.data), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 3,
      path: '/',
      secure: true,
    });

    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
}
