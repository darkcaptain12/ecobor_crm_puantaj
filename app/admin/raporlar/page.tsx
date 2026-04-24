import { supabaseServer } from '@/lib/supabase-server';
import { formatCurrency } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import { TrendingUp, Users, Award, ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RaporlarPage() {
  const [
    { data: orderStats },
    { data: topCustomers },
    { data: regionStats },
    { data: cropStats },
  ] = await Promise.all([
    supabaseServer.from('orders').select('total_amount, total_points, status'),
    supabaseServer.from('customers')
      .select('name, phone, total_points, region, crop_type')
      .order('total_points', { ascending: false })
      .limit(10),
    supabaseServer.from('customers')
      .select('region')
      .not('region', 'is', null),
    supabaseServer.from('customers')
      .select('crop_type')
      .not('crop_type', 'is', null),
  ]);

  const totalRevenue = orderStats?.reduce((s, o) => o.status !== 'CANCELLED' ? s + o.total_amount : s, 0) ?? 0;
  const totalPoints = orderStats?.reduce((s, o) => s + o.total_points, 0) ?? 0;
  const deliveredCount = orderStats?.filter((o) => o.status === 'DELIVERED').length ?? 0;

  const regionMap: Record<string, number> = {};
  regionStats?.forEach((r: any) => { regionMap[r.region] = (regionMap[r.region] ?? 0) + 1; });

  const cropMap: Record<string, number> = {};
  cropStats?.forEach((r: any) => { cropMap[r.crop_type] = (cropMap[r.crop_type] ?? 0) + 1; });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Raporlar & Analitik</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Gelir" value={formatCurrency(totalRevenue)} icon={TrendingUp} color="green" />
        <StatCard title="Teslim Edilen" value={deliveredCount} icon={ShoppingCart} color="blue" />
        <StatCard title="Dağıtılan Puan" value={totalPoints.toLocaleString()} icon={Award} color="yellow" />
        <StatCard title="Müşteri Sayısı" value={topCustomers?.length ?? 0} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En İyi Müşteriler */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">En Yüksek Puanlı Müşteriler</h2>
          <div className="space-y-2">
            {topCustomers?.map((c: any, i) => (
              <div key={c.phone} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-eco-green bg-eco-green-bg rounded-full">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-eco-text truncate">{c.name}</p>
                  <p className="text-xs text-eco-gray">{c.region} · {c.crop_type}</p>
                </div>
                <span className="font-bold text-eco-green text-sm">{c.total_points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bölge & Ekin Dağılımı */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
            <h2 className="font-semibold text-eco-text mb-3">Bölge Dağılımı</h2>
            <div className="space-y-2">
              {Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([region, count]) => (
                <div key={region} className="flex items-center justify-between text-sm">
                  <span className="text-eco-text-2">{region}</span>
                  <span className="font-semibold text-eco-text">{count} müşteri</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
            <h2 className="font-semibold text-eco-text mb-3">Ekin Türü Dağılımı</h2>
            <div className="space-y-2">
              {Object.entries(cropMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([crop, count]) => (
                <div key={crop} className="flex items-center justify-between text-sm">
                  <span className="text-eco-text-2">{crop}</span>
                  <span className="font-semibold text-eco-text">{count} müşteri</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
