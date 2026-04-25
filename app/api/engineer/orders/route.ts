export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get('status');
  const customerIdParam = req.nextUrl.searchParams.get('customer_id');
  let query = supabaseServer
    .from('orders')
    .select('id, order_number, status, total_amount, created_at, tracking_code, shipment_company, customer:customers(name, phone)')
    .eq('engineer_id', (token as any).id)
    .order('created_at', { ascending: false });

  if (statusParam) {
    const statuses = statusParam.split(',');
    query = query.in('status', statuses);
  }
  if (customerIdParam) {
    query = query.eq('customer_id', customerIdParam);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { customer_id, items, notes, is_field_sale } = await req.json();
  if (!customer_id || !items?.length) return NextResponse.json({ error: 'Müşteri ve ürün zorunludur' }, { status: 400 });

  // Ürünleri çek
  const productIds = items.map((i: any) => i.product_id);
  const { data: products } = await supabaseServer.from('products').select('*').in('id', productIds);

  // Toplam hesapla
  let totalAmount = 0;
  let totalPoints = 0;
  const orderItems = items.map((item: any) => {
    const product = products?.find((p: any) => p.id === item.product_id);
    const price = item.unit_price ?? product?.price ?? 0;
    const points = (product?.point_value ?? 0) * Math.floor(item.quantity);
    totalAmount += price * item.quantity;
    totalPoints += points;
    return { product_id: item.product_id, quantity: item.quantity, unit_price: price, points };
  });

  // Sipariş oluştur
  const { data: order, error: oErr } = await supabaseServer
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      customer_id, engineer_id: token.id,
      status: 'NEW', notes: notes || null,
      total_amount: totalAmount, total_points: totalPoints,
      is_field_sale: is_field_sale ?? false,
    })
    .select()
    .single();

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  // Kalemler ekle
  await supabaseServer.from('order_items').insert(
    orderItems.map((i: any) => ({ ...i, order_id: order.id }))
  );

  // Stok düş
  for (const item of orderItems) {
    if (is_field_sale) {
      await supabaseServer.from('engineer_inventory').upsert(
        { engineer_id: token.id, product_id: item.product_id, quantity: 0 },
        { onConflict: 'engineer_id,product_id' }
      );
      await supabaseServer.rpc('decrement_engineer_stock', {
        p_engineer_id: token.id, p_product_id: item.product_id, p_qty: item.quantity
      }).then(() => null, () => null);
    } else {
      await supabaseServer.rpc('decrement_main_stock', {
        p_product_id: item.product_id, p_qty: item.quantity
      }).then(() => null, () => null);
    }
  }

  // Puan kaydet
  if (totalPoints > 0) {
    await supabaseServer.from('reward_logs').insert({
      customer_id, order_id: order.id,
      type: 'earn', points: totalPoints,
      description: `${order.order_number} siparişinden kazanıldı`,
    });
  }

  return NextResponse.json(order, { status: 201 });
}
