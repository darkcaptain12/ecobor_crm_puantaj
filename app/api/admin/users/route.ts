export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('users')
    .select('id, name, phone, role, region, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { name, phone, password, role, region } = await req.json();
  if (!name || !phone || !password) return NextResponse.json({ error: 'Ad, telefon ve şifre zorunludur' }, { status: 400 });

  const { data: existing } = await supabaseServer.from('users').select('id').eq('phone', phone).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Bu telefon zaten kayıtlı' }, { status: 409 });

  const hashed = await hash(password, 10);
  const { data, error } = await supabaseServer
    .from('users')
    .insert({ name, phone, password: hashed, role: role || 'ENGINEER', region: region || null })
    .select('id, name, phone, role, region, is_active, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
