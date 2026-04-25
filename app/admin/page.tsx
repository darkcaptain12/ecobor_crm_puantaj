import { supabaseServer } from '@/lib/supabase-server';
import StatCard from '@/components/ui/StatCard';
import {
  Users, ShoppingCart, Package, Award, TrendingUp, AlertTriangle,
  Leaf, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { getActiveStages, priorityColor, priorityLabel } from '@/lib/crop-schedule';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    { count: customerCount },
    { count: orderCount },
    { data: recentOrders },
    { data: inventoryAll },
    { count: pendingCommissionsCount },
    { data: allOrders },
    { data: allCustomers },
    { data: users },
  ] = await Promise.all([
    supabaseServer.from('customers').select('*', { count: 'exact', head: true }),
    supabaseServer.from('orders').select('*', { count: 'exact', head: true }),
    supabaseServer.from('orders')
      .select('*, customer:customers(name, phone)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabaseServer.from('inventory').select('*, product:products(name, unit)'),
    supabaseServer.from('commissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseServer.from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', new Date(Date.now() - 180 * 86400_000).toISOString()),
    supabaseServer.from('customers')
      .select('id, name, crop_type, planting_date, assigned_to, total_points, status'),
    supabaseServer.from('users')
      .select('id, name, role')
      .in('role', ['ENGINEER', 'REMOTE_AGENT']),
  ]);

  const totalPoints = (allCustomers ?? []).reduce(
    (s: number, c: any) => s + (c.total_points ?? 0), 0
  );

  // Aylık satış grafiği
  const monthlyMap: Record<string, number> = {};
  for (const o of (allOrders ?? []) as any[]) {
    const month = o.created_at.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(o.total_amount);
  }
  const monthlySales = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({
      label: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      total,
    }));
  const maxSale = Math.max(...monthlySales.map((m) => m.total), 1);

  // Sipariş durum dağılımı
  const statusCounts: Record<string, number> = {};
  for (const o of (allOrders ?? []) as any[]) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }
  const orderStatuses = [
    { key: 'NEW', label: 'Yeni', color: 'bg-blue-500', icon: Clock },
    { key: 'PREPARING', label: 'Hazırlanıyor', color: 'bg-amber-500', icon: Package },
    { key: 'SHIPPED', label: 'Kargoda', color: 'bg-purple-500', icon: TrendingUp },
    { key: 'DELIVERED', label: 'Teslim', color: 'bg-green-500', icon: CheckCircle2 },
    { key: 'CANCELLED', label: 'İptal', color: 'bg-red-400', icon: XCircle },
  ];
  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  // Kültür tipi dağılımı
  const cropMap: Record<string, number> = {};
  for (const c of (allCustomers ?? []) as any[]) {
    if (c.crop_type) cropMap[c.crop_type] = (cropMap[c.crop_type] ?? 0) + 1;
  }
  const cropStats = Object.entries(cropMap).sort(([, a], [, b]) => b - a).slice(0, 6);
  const maxCrop = Math.max(...cropStats.map(([, v]) => v), 1);

  // Düşük stok
  const lowStock = (inventoryAll ?? []).filter((i: any) => i.quantity <= i.min_stock);

  // Dönemsel alarm (tüm mühendisler için)
  const seasonalAlerts: any[] = [];
  for (const c of (allCustomers ?? []) as any[]) {
    const active = getActiveStages(c.crop_type, c.planting_date);
    for (const stage of active) {
      const assignedUser = (users ?? []).find((u: any) => u.id === c.assigned_to);
      seasonalAlerts.push({
        customerId: c.id,
        customerName: c.name,
        cropType: c.crop_type,
        stageName: stage.label,
        products: stage.products,
        priority: stage.priority,
        daysLeft: stage.daysLeft,
        engineer: assignedUser?.name ?? '—',
      });
    }
  }
  seasonalAlerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.priority as 'critical' | 'high' | 'medium'] - order[b.priority as 'critical' | 'high' | 'medium'];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-eco-text">Ana Kontrol Paneli</h1>
        <p className="text-sm text-eco-text-2 mt-0.5">{formatDate(new Date())}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Müşteri" value={customerCount ?? 0} icon={Users} color="green" />
        <StatCard title="Toplam Sipariş" value={orderCount ?? 0} icon={ShoppingCart} color="blue" />
        <StatCard title="Bekleyen Komisyon" value={pendingCommissionsCount ?? 0} icon={TrendingUp} color="yellow" />
        <StatCard title="Toplam Puan" value={totalPoints.toLocaleString('tr-TR')} icon={Award} color="purple" />
      </div>

      {/* Grafikler — 2 kolon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Aylık Satış Grafiği */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-eco-green" />
              Aylık Satış (Son 6 Ay)
            </h2>
          </div>
          <div className="p-5">
            {monthlySales.length > 0 ? (
              <>
                <div className="flex items-end gap-2 h-36">
                  {monthlySales.map((m) => (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-eco-gray leading-none">
                        {m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}
                      </span>
                      <div
                        className="w-full bg-eco-green rounded-t transition-all hover:bg-eco-green/80"
                        style={{ height: `${Math.max((m.total / maxSale) * 100, 4)}px` }}
                      />
                      <span className="text-xs text-eco-gray">{m.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-eco-border flex justify-between text-xs text-eco-gray">
                  <span>Toplam</span>
                  <span className="font-semibold text-eco-text">
                    {formatCurrency(monthlySales.reduce((s, m) => s + m.total, 0))}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-center text-eco-gray text-sm py-8">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Sipariş Durum Grafiği */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-eco-blue" />
              Sipariş Durum Dağılımı
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {orderStatuses.map(({ key, label, color }) => {
              const count = statusCounts[key] ?? 0;
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-eco-text font-medium">{label}</span>
                    <span className="text-eco-gray">{count} sipariş ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-eco-bg rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kültür Tipi Dağılımı */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Leaf className="w-4 h-4 text-eco-green" />
              Kültür Tipi Dağılımı
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {cropStats.length > 0 ? cropStats.map(([crop, count]) => (
              <div key={crop}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-eco-text font-medium">{crop}</span>
                  <span className="text-eco-gray">{count} müşteri</span>
                </div>
                <div className="h-2 bg-eco-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-eco-green rounded-full"
                    style={{ width: `${(count / maxCrop) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-center text-eco-gray text-sm py-4">Veri yok</p>
            )}
          </div>
        </div>

        {/* Düşük Stok */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-eco-warning" />
              Stok Durumu
            </h2>
            <Link href="/admin/envanter" className="text-xs text-eco-green hover:underline">Tümü →</Link>
          </div>
          <div className="divide-y divide-eco-border">
            {(inventoryAll ?? []).slice(0, 6).map((item: any) => {
              const isLow = item.quantity <= item.min_stock;
              return (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-eco-text">{item.product?.name}</p>
                    <p className="text-xs text-eco-gray">Min: {item.min_stock} {item.product?.unit}</p>
                  </div>
                  <span className={`text-sm font-semibold ${isLow ? 'text-eco-error' : 'text-eco-green'}`}>
                    {item.quantity} {item.product?.unit}
                  </span>
                </div>
              );
            })}
            {!(inventoryAll ?? []).length && (
              <p className="text-center text-eco-gray text-sm py-8">Stok verisi yok</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Dönemsel Alarm ─── */}
      {seasonalAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Leaf className="w-4 h-4 text-eco-green" />
              Dönemsel Müdahale Alarmları
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {seasonalAlerts.filter((a) => a.priority === 'critical').length} kritik
            </span>
          </div>
          <div className="divide-y divide-eco-border">
            {seasonalAlerts.slice(0, 8).map((alert, i) => (
              <Link key={i} href={`/admin/musteriler/${alert.customerId}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-eco-bg transition-colors">
                <div className={`mt-0.5 px-2 py-1 rounded text-xs font-semibold border shrink-0 ${priorityColor[alert.priority as 'critical' | 'high' | 'medium']}`}>
                  {priorityLabel[alert.priority as 'critical' | 'high' | 'medium']}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-eco-text">{alert.customerName}</p>
                    <span className="text-xs text-eco-gray">· {alert.cropType}</span>
                  </div>
                  <p className="text-xs text-eco-green font-medium">{alert.stageName}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.products.map((p: string) => (
                      <span key={p} className="text-xs bg-eco-green/10 text-eco-green px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-eco-gray">{alert.daysLeft} gün kaldı</p>
                  <p className="text-xs text-eco-text-2 mt-0.5">{alert.engineer}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Son Siparişler */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center justify-between p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Son Siparişler</h2>
          <Link href="/admin/siparisler" className="text-xs text-eco-green hover:underline">Tümü →</Link>
        </div>
        <div className="divide-y divide-eco-border">
          {recentOrders?.map((order: any) => {
            const { label, variant } = statusBadge(order.status);
            return (
              <Link key={order.id} href={`/admin/siparisler/${order.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-eco-bg transition-colors">
                <div>
                  <p className="text-sm font-medium text-eco-text">{order.customer?.name}</p>
                  <p className="text-xs text-eco-gray">{order.order_number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-eco-text">{formatCurrency(order.total_amount)}</span>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </Link>
            );
          })}
          {!recentOrders?.length && (
            <p className="text-center text-eco-gray text-sm py-8">Henüz sipariş yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
