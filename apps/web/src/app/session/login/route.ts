import { redirect } from 'next/navigation';
import { checkSessionId } from '@/actions/session';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

export async function GET() {
  const sid = await checkSessionId();

  redirect(
    'https://discord.com/oauth2/authorize?' +
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        response_type: 'code',
        redirect_uri: `${BASE_URL}/api/oauth/token`,
        scope: 'identify guilds',
        state: sid,
      }).toString()
  );
}
