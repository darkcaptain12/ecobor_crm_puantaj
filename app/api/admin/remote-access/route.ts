import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { supabaseServer } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';

// GET — tüm kullanıcıların uzak erişim durumunu listele
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if ((token as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from('users')
    .select('id, name, phone, role, is_remote_enabled, remote_expire_at')
    .neq('role', 'CUSTOMER')
    .order('role')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH — belirli bir kullanıcının uzak erişimini aç/kapat
export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  if ((token as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await req.json();
  const { user_id, is_remote_enabled, remote_expire_at } = body;

  if (!user_id) return NextResponse.json({ error: 'user_id zorunludur' }, { status: 400 });

  const update: Record<string, any> = { is_remote_enabled: !!is_remote_enabled };
  if (remote_expire_at !== undefined) update.remote_expire_at = remote_expire_at || null;

  const { data, error } = await supabaseServer
    .from('users')
    .update(update)
    .eq('id', user_id)
    .select('id, name, is_remote_enabled, remote_expire_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
