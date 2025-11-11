import { Database } from '@dealbot/db/client';

export const db = new Database(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
