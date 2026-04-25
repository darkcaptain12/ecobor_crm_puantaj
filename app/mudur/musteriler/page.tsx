import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { MapPin, Wheat, Phone, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ExportButton from '@/components/shared/ExportButton';

export const dynamic = 'force-dynamic';

export default async function MudurMusteriler({
  searchParams,
}: {
  searchParams: { region?: string; crop_type?: string; q?: string; engineer?: string };
}) {
  let query = supabaseServer
    .from('customers')
    .select('*, assigned_user:users!assigned_to(name, phone)')
    .order('created_at', { ascending: false });

  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.crop_type) query = query.eq('crop_type', searchParams.crop_type);
  if (searchParams.engineer) query = query.eq('assigned_to', searchParams.engineer);
  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%`);

  const { data: customers } = await query;

  const [{ data: regions }, { data: cropTypes }, { data: engineers }] = await Promise.all([
    supabaseServer.from('customers').select('region').not('region', 'is', null),
    supabaseServer.from('customers').select('crop_type').not('crop_type', 'is', null),
    supabaseServer.from('users').select('id, name').in('role', ['ENGINEER', 'REMOTE_AGENT']),
  ]);

  const uniqueRegions = [...new Set(regions?.map((r: any) => r.region).filter(Boolean))];
  const uniqueCrops = [...new Set(cropTypes?.map((r: any) => r.crop_type).filter(Boolean))];

  const exportData = (customers ?? []).map((c: any) => ({
    'Ad Soyad': c.name,
    'Telefon': c.phone,
    'Bölge': c.region ?? '',
    'Ekin Türü': c.crop_type ?? '',
    'Ekim Tarihi': c.planting_date ?? '',
    'Durum': c.status,
    'Toplam Puan': c.total_points,
    'Atandığı Mühendis': c.assigned_user?.name ?? '',
    'Kayıt Tarihi': c.created_at?.slice(0, 10) ?? '',
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-eco-text">Tüm Müşteriler</h1>
        <ExportButton data={exportData} filename="musteriler" label="Excel İndir" />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-card border border-eco-border">
        <form method="get" className="flex flex-wrap gap-3">
          <input name="q" defaultValue={searchParams.q} placeholder="İsim veya telefon ara..." className="eco-input w-56" />
          <select name="region" defaultValue={searchParams.region ?? ''} className="eco-select w-40">
            <option value="">Tüm Bölgeler</option>
            {uniqueRegions.map((r: any) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select name="crop_type" defaultValue={searchParams.crop_type ?? ''} className="eco-select w-40">
            <option value="">Tüm Ekinler</option>
            {uniqueCrops.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="engineer" defaultValue={searchParams.engineer ?? ''} className="eco-select w-48">
            <option value="">Tüm Mühendisler</option>
            {(engineers ?? []).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button type="submit" className="eco-btn-primary px-4 py-2">Filtrele</button>
          <Link href="/mudur/musteriler" className="eco-btn-secondary px-4 py-2">Temizle</Link>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Müşteri', 'Telefon', 'Bölge', 'Ekin Türü', 'Durum', 'Puan', 'Mühendis', 'Tarih'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
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
                      {c.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</span>}
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">
                      {c.crop_type && <span className="flex items-center gap-1"><Wheat className="w-3 h-3" />{c.crop_type}</span>}
                    </td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-eco-green">{c.total_points}</td>
                    <td className="px-4 py-3 text-eco-text-2">{c.assigned_user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                );
              })}
              {!customers?.length && (
                <tr><td colSpan={8} className="text-center py-10 text-eco-gray">Müşteri bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
