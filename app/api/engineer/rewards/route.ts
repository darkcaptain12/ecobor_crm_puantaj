export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/engineer/rewards?customer_id=xxx — müşterinin puanı + uygun ödüller
export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const customerId = req.nextUrl.searchParams.get('customer_id');
  if (!customerId) return NextResponse.json({ error: 'customer_id gerekli' }, { status: 400 });

  const [{ data: customer }, { data: rules }] = await Promise.all([
    supabaseServer.from('customers').select('id, name, total_points').eq('id', customerId).single(),
    supabaseServer.from('reward_rules').select('*').eq('is_active', true).order('points_required'),
  ]);

  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });

  const eligible = (rules ?? []).filter((r: any) => r.points_required <= customer.total_points);
  return NextResponse.json({ customer, rules: rules ?? [], eligible });
}

// POST /api/engineer/rewards — hediye verildi işaretle
export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { customer_id, reward_rule_id } = await req.json();
  if (!customer_id || !reward_rule_id) {
    return NextResponse.json({ error: 'customer_id ve reward_rule_id zorunlu' }, { status: 400 });
  }

  // Ödül kuralını getir
  const { data: rule } = await supabaseServer
    .from('reward_rules')
    .select('*')
    .eq('id', reward_rule_id)
    .eq('is_active', true)
    .single();

  if (!rule) return NextResponse.json({ error: 'Ödül kuralı bulunamadı' }, { status: 404 });

  // Müşteri puanını kontrol et
  const { data: customer } = await supabaseServer
    .from('customers')
    .select('id, name, total_points')
    .eq('id', customer_id)
    .single();

  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
  if (customer.total_points < rule.points_required) {
    return NextResponse.json(
      { error: `Yetersiz puan. Gerekli: ${rule.points_required}, Mevcut: ${customer.total_points}` },
      { status: 400 }
    );
  }

  // Puan düş (reward_log kaydı — trigger customers.total_points'i otomatik günceller)
  const { error: logErr } = await supabaseServer.from('reward_logs').insert({
    customer_id,
    type: 'redeem',
    points: -rule.points_required,
    description: `${rule.reward_name} hediyesi verildi (Mühendis: ${(token as any).name ?? 'Bilinmiyor'})`,
    reward_rule_id,
  });

  if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

  // Trigger yoksa manuel güncelle
  await supabaseServer
    .from('customers')
    .update({ total_points: customer.total_points - rule.points_required })
    .eq('id', customer_id);

  return NextResponse.json({
    success: true,
    message: `${customer.name} için "${rule.reward_name}" hediyesi işlendi. ${rule.points_required} puan düşüldü.`,
    remaining_points: customer.total_points - rule.points_required,
  });
}
