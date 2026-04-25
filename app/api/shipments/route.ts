import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { supabaseServer } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';

// GET /api/shipments?order_id=xxx
export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get('order_id');
  const orderIds = req.nextUrl.searchParams.get('order_ids');
  let query = supabaseServer
    .from('shipments')
    .select('*, order:orders(id, customer_id, customer:customers(name, phone))')
    .order('created_at', { ascending: false });

  if (orderId) query = query.eq('order_id', orderId);
  else if (orderIds) query = query.in('order_id', orderIds.split(','));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/shipments — yeni kargo kaydı
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const role = (token as any)?.role;
  if (!token || !['ADMIN', 'ENGINEER'].includes(role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await req.json();
  const { order_id, tracking_number, carrier = 'Yurtiçi', notes } = body;

  if (!order_id || !tracking_number) {
    return NextResponse.json({ error: 'order_id ve tracking_number zorunludur' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('shipments')
    .insert({ order_id, tracking_number, carrier, notes, status: 'preparing' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Siparişin durumunu PREPARING yap
  await supabaseServer.from('orders').update({ status: 'PREPARING', tracking_code: tracking_number, shipment_company: carrier }).eq('id', order_id);

  return NextResponse.json(data, { status: 201 });
}
