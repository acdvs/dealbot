import { Database } from '@dealbot/db/client';

export const db = new Database(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);
