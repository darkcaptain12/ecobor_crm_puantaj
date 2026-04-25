import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { Plus, MapPin, Wheat, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ExportButton from '@/components/shared/ExportButton';

export const dynamic = 'force-dynamic';

export default async function AdminMusteriler({
  searchParams,
}: {
  searchParams: { region?: string; crop_type?: string; q?: string };
}) {
  let query = supabaseServer
    .from('customers')
    .select('*, assigned_user:users!assigned_to(name)')
    .order('created_at', { ascending: false });

  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.crop_type) query = query.eq('crop_type', searchParams.crop_type);
  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%`);

  const { data: customers } = await query;

  const { data: regions } = await supabaseServer.from('customers').select('region').not('region', 'is', null);
  const uniqueRegions = [...new Set(regions?.map((r: any) => r.region).filter(Boolean))];
  const { data: cropTypes } = await supabaseServer.from('customers').select('crop_type').not('crop_type', 'is', null);
  const uniqueCrops = [...new Set(cropTypes?.map((r: any) => r.crop_type).filter(Boolean))];

  const exportData = (customers ?? []).map((c: any) => ({
    'Ad Soyad': c.name, 'Telefon': c.phone, 'Bölge': c.region ?? '',
    'Ekin Türü': c.crop_type ?? '', 'Ekim Tarihi': c.planting_date ?? '',
    'Durum': c.status, 'Toplam Puan': c.total_points,
    'Atandığı Mühendis': c.assigned_user?.name ?? '',
    'Kayıt Tarihi': c.created_at?.slice(0, 10) ?? '',
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-eco-text">Müşteriler ({customers?.length ?? 0})</h1>
        <div className="flex items-center gap-2">
          <ExportButton data={exportData} filename="musteriler" />
          <Link href="/admin/musteriler/yeni" className="eco-btn-primary text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Yeni Müşteri</span>
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl p-4 border border-eco-border">
        <form method="get" className="flex flex-wrap gap-2">
          <input name="q" defaultValue={searchParams.q} placeholder="İsim veya telefon..." className="eco-input flex-1 min-w-[160px]" />
          <select name="region" defaultValue={searchParams.region ?? ''} className="eco-select flex-1 min-w-[140px]">
            <option value="">Tüm Bölgeler</option>
            {uniqueRegions.map((r: any) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select name="crop_type" defaultValue={searchParams.crop_type ?? ''} className="eco-select flex-1 min-w-[140px]">
            <option value="">Tüm Ekinler</option>
            {uniqueCrops.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="eco-btn-primary px-4">Ara</button>
          <Link href="/admin/musteriler" className="eco-btn-secondary px-4">Temizle</Link>
        </form>
      </div>

      {/* Masaüstü tablo */}
      <div className="hidden sm:block bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Müşteri', 'Telefon', 'Bölge', 'Ekin Türü', 'Durum', 'Puan', 'Atandığı', 'Tarih', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {customers?.map((c: any) => {
                const { label, variant } = statusBadge(c.status);
                return (
                  <tr key={c.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-medium text-eco-text">{c.name}</td>
                    <td className="px-4 py-3 text-eco-text-2">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">
                      {c.region ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">
                      {c.crop_type ? <span className="flex items-center gap-1"><Wheat className="w-3 h-3" />{c.crop_type}</span> : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-eco-green">{c.total_points}</td>
                    <td className="px-4 py-3 text-eco-text-2">{c.assigned_user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/musteriler/${c.id}`} className="eco-btn-secondary text-xs px-3 py-1">Detay</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!customers?.length && <p className="text-center text-eco-gray py-12">Müşteri bulunamadı</p>}
        </div>
      </div>

      {/* Mobil kart görünümü */}
      <div className="sm:hidden space-y-3">
        {!customers?.length && <p className="text-center text-eco-gray py-12">Müşteri bulunamadı</p>}
        {customers?.map((c: any) => {
          const { label, variant } = statusBadge(c.status);
          return (
            <Link key={c.id} href={`/admin/musteriler/${c.id}`}
              className="block bg-white rounded-xl border border-eco-border p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-eco-text">{c.name}</p>
                  <p className="text-xs text-eco-gray flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{c.phone}
                  </p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-eco-text-2">
                <span>{c.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</span>}</span>
                <span className="font-semibold text-eco-green">{c.total_points} puan</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
