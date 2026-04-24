export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['REMOTE_AGENT', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { customer_id, items } = await req.json();
  if (!customer_id || !items?.length) return NextResponse.json({ error: 'Müşteri ve ürün zorunludur' }, { status: 400 });

  // Müşteri bu agent'a mı atanmış?
  const { data: customer } = await supabaseServer
    .from('customers').select('id').eq('id', customer_id).eq('assigned_to', token.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: 'Bu müşteriyi satış için yetkiniz yok' }, { status: 403 });

  const productIds = items.map((i: any) => i.product_id);
  const { data: products } = await supabaseServer.from('products').select('*').in('id', productIds);

  let totalAmount = 0;
  let totalPoints = 0;
  const orderItems = items.map((item: any) => {
    const product = products?.find((p: any) => p.id === item.product_id);
    const price = item.unit_price ?? product?.price ?? 0;
    const pts = (product?.point_value ?? 0) * Math.floor(item.quantity);
    totalAmount += price * item.quantity;
    totalPoints += pts;
    return { product_id: item.product_id, quantity: item.quantity, unit_price: price, points: pts };
  });

  const { data: order, error: oErr } = await supabaseServer.from('orders').insert({
    order_number: generateOrderNumber(),
    customer_id, engineer_id: token.id,
    status: 'NEW', total_amount: totalAmount, total_points: totalPoints,
    is_field_sale: true,
  }).select().single();

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  await supabaseServer.from('order_items').insert(
    orderItems.map((i: any) => ({ ...i, order_id: order.id }))
  );

  if (totalPoints > 0) {
    await supabaseServer.from('reward_logs').insert({
      customer_id, order_id: order.id, type: 'earn',
      points: totalPoints, description: `${order.order_number} siparişinden kazanıldı`,
    });
  }

  // Komisyon oluştur (%10 varsayılan)
  await supabaseServer.from('commissions').insert({
    agent_id: token.id, order_id: order.id,
    amount: totalAmount * 0.10, rate: 10, status: 'pending',
  });

  return NextResponse.json(order, { status: 201 });
}
