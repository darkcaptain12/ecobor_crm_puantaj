import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function requireRole(req: NextRequest, roles: string[]) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !roles.includes((token as any).role)) return null;
  return token as { id: string; role: string; name?: string };
}

export async function requireAdmin(req: NextRequest) {
  return requireRole(req, ['ADMIN']);
}
