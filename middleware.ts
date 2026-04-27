import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Şirket IP adresi — Vercel env'den okunur (virgülle birden fazla IP eklenebilir)
const COMPANY_IP = process.env.COMPANY_IP ?? '';
const ALLOWED_IPS = COMPANY_IP ? COMPANY_IP.split(',').map(ip => ip.trim()).filter(Boolean) : [];

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

function addSecurityHeaders(res: NextResponse): NextResponse {
  // Tarayıcıların CRM sayfasını önbelleğe almasını engelle
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  // Clickjacking koruması
  res.headers.set('X-Frame-Options', 'DENY');
  // MIME sniffing koruması
  res.headers.set('X-Content-Type-Options', 'nosniff');
  // Referrer bilgisini gizle
  res.headers.set('Referrer-Policy', 'no-referrer');
  return res;
}

export default withAuth(
  function middleware(req) {
    const role = ((req.nextauth.token as any)?.role as string) ?? '';
    const path = req.nextUrl.pathname;
    const isRemoteEnabled = (req.nextauth.token as any)?.is_remote_enabled ?? false;

    // ── IP Kısıtlama ──────────────────────────────────────────────
    // /puan ve /musteri (çiftçi paneli) her yerden erişilebilir
    const isFarmerRoute = path.startsWith('/musteri') || path.startsWith('/puan') || path.startsWith('/api/customer');
    const isAuthRoute = path.startsWith('/api/auth') || path === '/giris' || path === '/erisim-engellendi';

    if (ALLOWED_IPS.length > 0 && !isFarmerRoute && !isAuthRoute) {
      const clientIp = getClientIp(req as any);
      const isAllowedIp = ALLOWED_IPS.includes(clientIp);

      if (!isAllowedIp && !isRemoteEnabled) {
        if (path.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Dış erişim engellendi. Yöneticinizle iletişime geçin.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/erisim-engellendi', req.url));
      }
    }

    // ── Export endpoint'leri — ekstra kontrol ─────────────────────
    // Export sadece oturumu olan kullanıcılara açık, token zorunlu
    if (path.includes('/export')) {
      const token = (req.nextauth.token as any);
      if (!token?.id) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
      }
    }

    // ── Rol Tabanlı Yetkilendirme ──────────────────────────────────
    const rules: Record<string, string[]> = {
      '/admin': ['ADMIN'],
      '/mudur': ['MANAGER', 'ADMIN'],
      '/dashboard': ['ENGINEER', 'ADMIN'],
      '/saha': ['REMOTE_AGENT', 'ADMIN'],
      '/musteri': ['CUSTOMER'],
    };

    for (const [prefix, allowed] of Object.entries(rules)) {
      if (path.startsWith(prefix) && !allowed.includes(role)) {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }
        if (prefix === '/musteri') {
          return NextResponse.redirect(new URL('/puan', req.url));
        }
        return NextResponse.redirect(new URL(`/giris?redirect=${encodeURIComponent(path)}`, req.url));
      }
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/giris' },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/mudur/:path*',
    '/dashboard/:path*',
    '/saha/:path*',
    '/musteri/:path*',
    '/api/admin/:path*',
    '/api/engineer/:path*',
    '/api/agent/:path*',
    '/api/customer/:path*',
    '/api/shipments/:path*',
  ],
};
