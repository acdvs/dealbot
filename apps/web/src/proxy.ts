import { NextResponse, type NextRequest } from 'next/server';
import { checkSessionId, getSession } from './actions/session';

export async function proxy(req: NextRequest) {
  await checkSessionId();
  const session = await getSession();

  if (
    req.nextUrl.pathname.startsWith('/dashboard') &&
    (!session || !session.access_token)
  ) {
    return NextResponse.redirect(new URL('/session/login', req.nextUrl));
  }

  if (req.nextUrl.pathname === '/' && session?.access_token) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
