import { RedirectType, redirect } from 'next/navigation';

import { deleteSession } from '@/actions/session';

export async function GET() {
  await deleteSession();

  redirect('/', RedirectType.replace);
}
