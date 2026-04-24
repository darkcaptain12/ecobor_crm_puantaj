export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['CUSTOMER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data: customer, error: cErr } = await supabaseServer
    .from('customers')
    .select('id, name, total_points')
    .eq('user_id', token.id)
    .maybeSingle();

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  if (!customer) return NextResponse.json({ error: 'Müşteri kaydı bulunamadı' }, { status: 404 });

  const { data: logs, error: lErr } = await supabaseServer
    .from('reward_logs')
    .select('id, type, points, description, created_at, order:orders(order_number)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const { data: rules } = await supabaseServer
    .from('reward_rules')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true });

  const nextReward = rules?.find(r => r.points_required > customer.total_points) ?? null;

  return NextResponse.json({ customer, logs, nextReward, rules });
}
