export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('commissions')
    .select('*, agent:users!agent_id(name, phone), order:orders(order_number, total_amount)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
