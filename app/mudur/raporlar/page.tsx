import { supabaseServer } from '@/lib/supabase-server';
import { formatCurrency } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import { TrendingUp, Users, Award, ShoppingCart } from 'lucide-react';
import ExportButton from '@/components/shared/ExportButton';

export const dynamic = 'force-dynamic';

export default async function MudurRaporlar() {
  const [
    { data: orderStats },
    { data: topCustomers },
    { data: regionStats },
    { data: cropStats },
    { data: engineerStats },
  ] = await Promise.all([
    supabaseServer.from('orders').select('total_amount, total_points, status'),
    supabaseServer.from('customers')
      .select('name, phone, total_points, region, crop_type')
      .order('total_points', { ascending: false })
      .limit(10),
    supabaseServer.from('customers').select('region').not('region', 'is', null),
    supabaseServer.from('customers').select('crop_type').not('crop_type', 'is', null),
    supabaseServer.from('orders')
      .select('engineer:users(name), total_amount')
      .not('engineer_id', 'is', null),
  ]);

  const totalRevenue = orderStats?.reduce((s, o: any) => o.status !== 'CANCELLED' ? s + Number(o.total_amount) : s, 0) ?? 0;
  const totalPoints = orderStats?.reduce((s, o: any) => s + o.total_points, 0) ?? 0;
  const deliveredCount = orderStats?.filter((o: any) => o.status === 'DELIVERED').length ?? 0;

  const regionMap: Record<string, number> = {};
  regionStats?.forEach((r: any) => { regionMap[r.region] = (regionMap[r.region] ?? 0) + 1; });

  const cropMap: Record<string, number> = {};
  cropStats?.forEach((r: any) => { cropMap[r.crop_type] = (cropMap[r.crop_type] ?? 0) + 1; });

  const engineerMap: Record<string, number> = {};
  engineerStats?.forEach((o: any) => {
    const name = o.engineer?.name ?? 'Bilinmiyor';
    engineerMap[name] = (engineerMap[name] ?? 0) + Number(o.total_amount);
  });

  const exportTopCustomers = (topCustomers ?? []).map((c: any) => ({
    'Ad Soyad': c.name,
    'Telefon': c.phone,
    'Bölge': c.region ?? '',
    'Ekin Türü': c.crop_type ?? '',
    'Toplam Puan': c.total_points,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Raporlar & Analitik</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Ciro" value={formatCurrency(totalRevenue)} icon={TrendingUp} color="green" />
        <StatCard title="Teslim Edilen" value={deliveredCount} icon={ShoppingCart} color="blue" />
        <StatCard title="Dağıtılan Puan" value={totalPoints.toLocaleString('tr-TR')} icon={Award} color="yellow" />
        <StatCard title="Toplam Müşteri" value={Object.keys(regionMap).length > 0 ? Object.values(regionMap).reduce((a, b) => a + b, 0) : 0} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bölge Dağılımı */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Bölge Dağılımı</h2>
          <div className="space-y-2">
            {Object.entries(regionMap).sort(([, a], [, b]) => b - a).map(([region, count]) => (
              <div key={region} className="flex justify-between items-center text-sm">
                <span className="text-eco-text-2">{region}</span>
                <span className="font-semibold text-eco-text">{count} müşteri</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekin Tipi Dağılımı */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Ekin Tipi Dağılımı</h2>
          <div className="space-y-2">
            {Object.entries(cropMap).sort(([, a], [, b]) => b - a).map(([crop, count]) => (
              <div key={crop} className="flex justify-between items-center text-sm">
                <span className="text-eco-text-2">{crop}</span>
                <span className="font-semibold text-eco-text">{count} müşteri</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mühendis Satış Performansı */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Mühendis Satışları</h2>
          <div className="space-y-2">
            {Object.entries(engineerMap)
              .sort(([, a], [, b]) => b - a)
              .map(([name, total]) => (
                <div key={name} className="flex justify-between items-center text-sm">
                  <span className="text-eco-text-2">{name}</span>
                  <span className="font-semibold text-eco-green">{formatCurrency(total)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* En Yüksek Puanlı Müşteriler */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center justify-between p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">En Yüksek Puanlı Müşteriler</h2>
          <ExportButton data={exportTopCustomers} filename="top_musteriler" label="Excel İndir" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['#', 'Müşteri', 'Telefon', 'Bölge', 'Ekin', 'Puan'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {topCustomers?.map((c: any, i) => (
                <tr key={c.phone} className="hover:bg-eco-bg/50">
                  <td className="px-4 py-3 text-eco-gray font-bold">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-eco-text">{c.name}</td>
                  <td className="px-4 py-3 text-eco-text-2">{c.phone}</td>
                  <td className="px-4 py-3 text-eco-text-2">{c.region ?? '—'}</td>
                  <td className="px-4 py-3 text-eco-text-2">{c.crop_type ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-eco-green">{c.total_points.toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
