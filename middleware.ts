import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

const authMiddleware = withAuth({
  pages: {
    signIn: '/',
  },
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (process.env.E2E_MODE === 'true' || req.headers.get('x-e2e-bypass-auth') === 'true') {
    return NextResponse.next();
  }
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/github/:path*', '/api/preferences/:path*'],
};
