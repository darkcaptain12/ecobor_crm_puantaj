import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const role = ((req.nextauth.token as any)?.role as string) ?? '';
    const path = req.nextUrl.pathname;

    const rules: Record<string, string[]> = {
      '/admin': ['ADMIN'],
      '/dashboard': ['ENGINEER', 'ADMIN'],
      '/saha': ['REMOTE_AGENT', 'ADMIN'],
      '/musteri': ['CUSTOMER'],
    };

    for (const [prefix, allowed] of Object.entries(rules)) {
      if (path.startsWith(prefix) && !allowed.includes(role)) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(`/giris?redirect=${encodeURIComponent(path)}`, req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/giris' },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/saha/:path*',
    '/musteri/:path*',
    '/api/admin/:path*',
    '/api/engineer/:path*',
    '/api/agent/:path*',
    '/api/customer/:path*',
  ],
};
