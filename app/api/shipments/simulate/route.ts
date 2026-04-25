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

// POST /api/shipments/simulate — demo: teslimata ilerlememiş kargoları rastgele ilerlet
export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  const role = (token as any)?.role;
  if (!token || !['ADMIN', 'ENGINEER', 'MANAGER'].includes(role)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  // Teslim edilmemiş kargolar
  const { data: active, error } = await supabaseServer
    .from('shipments')
    .select('id, status, order_id')
    .neq('status', 'delivered');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!active || active.length === 0) {
    return NextResponse.json({ message: 'Güncellenecek kargo yok', updated: 0 });
  }

  let updated = 0;
  const updates: Array<{ id: string; status: ShipmentStatus; order_id: string }> = [];

  for (const shipment of active) {
    // %60 ihtimalle ilerlet
    if (Math.random() < 0.6) {
      const currentIdx = STATUS_FLOW.indexOf(shipment.status as ShipmentStatus);
      if (currentIdx < STATUS_FLOW.length - 1) {
        const nextStatus = STATUS_FLOW[currentIdx + 1];
        updates.push({ id: shipment.id, status: nextStatus, order_id: shipment.order_id });
        updated++;
      }
    }
  }

  // Toplu güncelle
  await Promise.all(
    updates.map(async (u) => {
      await supabaseServer
        .from('shipments')
        .update({ status: u.status, updated_at: new Date().toISOString() })
        .eq('id', u.id);

      await supabaseServer
        .from('orders')
        .update({ status: STATUS_ORDER_MAP[u.status] })
        .eq('id', u.order_id);
    })
  );

  return NextResponse.json({
    message: `${updated} kargo güncellendi`,
    updated,
    details: updates.map((u) => ({ id: u.id, newStatus: u.status })),
  });
}
