import { redirect } from 'next/navigation';
import { BASE_URL } from '@/lib/environment';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

export async function GET() {
  redirect(
    'https://discord.com/oauth2/authorize?' +
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: BASE_URL!,
        permissions: '274877908992',
        integration_type: '0',
        scope: 'bot applications.commands',
      }).toString()
  );
}
