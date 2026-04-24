import { supabaseServer } from '@/lib/supabase-server';
import StatCard from '@/components/ui/StatCard';
import { Users, ShoppingCart, Package, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    { count: customerCount },
    { count: orderCount },
    { data: recentOrders },
    { data: lowStock },
    { count: pendingCommissionsCount },
  ] = await Promise.all([
    supabaseServer.from('customers').select('*', { count: 'exact', head: true }),
    supabaseServer.from('orders').select('*', { count: 'exact', head: true }),
    supabaseServer.from('orders')
      .select('*, customer:customers(name, phone)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabaseServer.from('inventory')
      .select('*, product:products(name, unit)')
      .filter('quantity', 'lte', supabaseServer.from('inventory').select('min_stock'))
      .limit(5),
    supabaseServer.from('commissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const { data: totalPointsData } = await supabaseServer
    .from('customers')
    .select('total_points');
  const totalPoints = totalPointsData?.reduce((s, c) => s + c.total_points, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-eco-text">Ana Kontrol Paneli</h1>
        <p className="text-sm text-eco-text-2 mt-0.5">{formatDate(new Date())}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Müşteri" value={customerCount ?? 0} icon={Users} color="green" />
        <StatCard title="Toplam Sipariş" value={orderCount ?? 0} icon={ShoppingCart} color="blue" />
        <StatCard title="Bekleyen Komisyon" value={pendingCommissionsCount ?? 0} icon={TrendingUp} color="yellow" />
        <StatCard title="Toplam Puan" value={totalPoints.toLocaleString('tr-TR')} icon={Award} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Düşük Stok Uyarıları */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-eco-warning" />
              Düşük Stok Uyarıları
            </h2>
            <Link href="/admin/envanter" className="text-xs text-eco-green hover:underline">Stok →</Link>
          </div>
          <div className="divide-y divide-eco-border">
            {lowStock?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-eco-text">{item.product?.name}</p>
                  <p className="text-xs text-eco-gray">Min: {item.min_stock} {item.product?.unit}</p>
                </div>
                <span className="text-sm font-semibold text-eco-error">{item.quantity} {item.product?.unit}</span>
              </div>
            ))}
            {!lowStock?.length && (
              <p className="text-center text-eco-gray text-sm py-8">Stok seviyeleri normal</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
