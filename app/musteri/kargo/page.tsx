import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { Truck, Package, CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; step: number }> = {
  preparing: { label: 'Hazırlanıyor', color: 'text-yellow-600', icon: Package, step: 1 },
  shipped: { label: 'Kargoya Verildi', color: 'text-blue-600', icon: Truck, step: 2 },
  in_transit: { label: 'Yolda', color: 'text-purple-600', icon: Truck, step: 3 },
  delivered: { label: 'Teslim Edildi', color: 'text-eco-green', icon: CheckCircle2, step: 4 },
};

export default async function MusteriKargo() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Müşterinin siparişlerini + kargolarını getir
  const { data: customer } = await supabaseServer
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  // customers tablosunda eşleşme yoksa kullanıcı ID ile dene
  const customerId = customer?.id ?? userId;

  const { data: orders } = await supabaseServer
    .from('orders')
    .select('id, status, total_amount, created_at, shipment_company, tracking_code')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  const orderIds = (orders ?? []).map((o: any) => o.id);
  const { data: shipments } = orderIds.length > 0
    ? await supabaseServer
        .from('shipments')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const shipmentByOrder: Record<string, any> = {};
  (shipments ?? []).forEach((s: any) => { shipmentByOrder[s.order_id] = s; });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-eco-text">Kargolarım</h1>

      {!orders?.length ? (
        <div className="text-center py-12 text-eco-gray">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const shipment = shipmentByOrder[order.id];
            const cfg = shipment ? STATUS_CONFIG[shipment.status] ?? STATUS_CONFIG.preparing : null;
            const Icon = cfg?.icon ?? Package;

            return (
              <div key={order.id} className="bg-white rounded-xl border border-eco-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-eco-gray">Sipariş #{order.id.slice(0, 8)}</p>
                    <p className="font-semibold text-eco-text">
                      {Number(order.total_amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                  {cfg ? (
                    <span className={`text-sm font-semibold flex items-center gap-1 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                    </span>
                  ) : (
                    <span className="text-xs text-eco-gray bg-eco-bg px-2 py-1 rounded-full">Kargo bekleniyor</span>
                  )}
                </div>

                {shipment && (
                  <>
                    {/* İlerleme */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 flex-1 rounded-full ${step <= (cfg?.step ?? 0) ? 'bg-eco-green' : 'bg-eco-border'}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-eco-gray">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {shipment.carrier} · <span className="font-mono">{shipment.tracking_number}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(shipment.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </>
                )}

                {!shipment && order.tracking_code && (
                  <p className="text-xs text-eco-gray mt-2">
                    <Truck className="w-3 h-3 inline mr-1" />
                    {order.shipment_company} · {order.tracking_code}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
