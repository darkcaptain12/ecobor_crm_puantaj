import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { supabaseServer } from '@/lib/supabase-server';
import type { NextRequest } from 'next/server';

const STATUS_FLOW = ['preparing', 'shipped', 'in_transit', 'delivered'] as const;
type ShipmentStatus = typeof STATUS_FLOW[number];

const STATUS_ORDER_MAP: Record<ShipmentStatus, string> = {
  preparing: 'PREPARING',
  shipped: 'SHIPPED',
  in_transit: 'SHIPPED',
  delivered: 'DELIVERED',
};

// PUT /api/shipments/[id] — durum güncelle
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  const role = (token as any)?.role;
  if (!token || !['ADMIN', 'ENGINEER'].includes(role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await req.json();
  const { status, notes } = body;

  if (!STATUS_FLOW.includes(status)) {
    return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
  }

  const { data: shipment, error: fetchErr } = await supabaseServer
    .from('shipments')
    .select('order_id')
    .eq('id', params.id)
    .single();

  if (fetchErr || !shipment) return NextResponse.json({ error: 'Kargo bulunamadı' }, { status: 404 });

  const { data, error } = await supabaseServer
    .from('shipments')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sipariş durumunu senkronize et
  const orderStatus = STATUS_ORDER_MAP[status as ShipmentStatus];
  await supabaseServer.from('orders').update({ status: orderStatus }).eq('id', shipment.order_id);

  return NextResponse.json(data);
}

// GET /api/shipments/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('shipments')
    .select('*, order:orders(id, customer_id, status, customer:customers(name, phone))')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
