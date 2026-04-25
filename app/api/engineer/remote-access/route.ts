import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { supabaseServer } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';

// GET — kendi uzak erişim durumumu getir
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('users')
    .select('id, is_remote_enabled, remote_expire_at')
    .eq('id', (token as any).id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH — kendi uzak erişimini aç/kapat (sadece kendisi)
export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  const role = (token as any)?.role;
  if (!token || !['ENGINEER', 'REMOTE_AGENT', 'ADMIN', 'MANAGER'].includes(role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await req.json();
  const { is_remote_enabled } = body;

  const update: Record<string, any> = { is_remote_enabled: !!is_remote_enabled };
  // Açınca 7 günlük varsayılan süre
  if (is_remote_enabled) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    update.remote_expire_at = expiry.toISOString();
  } else {
    update.remote_expire_at = null;
  }

  const { data, error } = await supabaseServer
    .from('users')
    .update(update)
    .eq('id', (token as any).id)
    .select('id, is_remote_enabled, remote_expire_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
