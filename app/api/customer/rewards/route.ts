export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['CUSTOMER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data: customer, error: cErr } = await supabaseServer
    .from('customers')
    .select('id, total_points')
    .eq('user_id', token.id)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!customer) return NextResponse.json({ error: 'Müşteri kaydı bulunamadı' }, { status: 404 });

  const { data: rules, error: rErr } = await supabaseServer
    .from('reward_rules')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true });

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const eligible = rules?.filter(r => r.points_required <= customer.total_points) ?? [];

  return NextResponse.json({ total_points: customer.total_points, rules, eligible });
}
