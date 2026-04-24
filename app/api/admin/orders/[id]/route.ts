export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('orders')
    .select('*, customer:customers(name, phone), engineer:users(name), items:order_items(*, product:products(name, unit))')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseServer
    .from('orders')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
