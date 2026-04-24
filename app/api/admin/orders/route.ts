export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status');
  let query = supabaseServer
    .from('orders')
    .select('*, customer:customers(name, phone), engineer:users(name)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
