import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import ExportButton from '@/components/shared/ExportButton';

export const dynamic = 'force-dynamic';

export default async function MudurSiparisler({ searchParams }: { searchParams: { status?: string } }) {
  let query = supabaseServer
    .from('orders')
    .select('*, customer:customers(name, phone), engineer:users(name)')
    .order('created_at', { ascending: false });

  if (searchParams.status) query = query.eq('status', searchParams.status);

  const { data: orders } = await query;
  const statuses = ['NEW', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const exportData = (orders ?? []).map((o: any) => ({
    'Sipariş No': o.order_number,
    'Müşteri': o.customer?.name ?? '',
    'Müşteri Tel': o.customer?.phone ?? '',
    'Mühendis': o.engineer?.name ?? '',
    'Tutar': o.total_amount,
    'Puan': o.total_points,
    'Durum': o.status,
    'Kargo Şirketi': o.shipment_company ?? '',
    'Takip Kodu': o.tracking_code ?? '',
    'Tarih': o.created_at?.slice(0, 10) ?? '',
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-eco-text">Siparişler</h1>
        <ExportButton data={exportData} filename="siparisler" label="Excel İndir" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/mudur/siparisler"
          className={`eco-btn text-xs px-3 py-1.5 ${!searchParams.status ? 'bg-eco-green text-white' : 'bg-white border border-eco-border text-eco-text-2'}`}>
          Tümü
        </Link>
        {statuses.map((s) => {
          const { label } = statusBadge(s);
          return (
            <Link key={s} href={`/mudur/siparisler?status=${s}`}
              className={`eco-btn text-xs px-3 py-1.5 ${searchParams.status === s ? 'bg-eco-green text-white' : 'bg-white border border-eco-border text-eco-text-2'}`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Masaüstü tablo */}
      <div className="hidden sm:block bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Sipariş No', 'Müşteri', 'Mühendis', 'Tutar', 'Puan', 'Durum', 'Tarih'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {orders?.map((o: any) => {
                const { label, variant } = statusBadge(o.status);
                return (
                  <tr key={o.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-mono text-xs text-eco-text">{o.order_number}</td>
                    <td className="px-4 py-3 font-medium text-eco-text">{o.customer?.name}</td>
                    <td className="px-4 py-3 text-eco-text-2">{o.engineer?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3 text-eco-green font-medium">{o.total_points}</td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(o.created_at)}</td>
                  </tr>
                );
              })}
              {!orders?.length && (
                <tr><td colSpan={7} className="text-center py-10 text-eco-gray">Sipariş bulunamadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobil kart */}
      <div className="sm:hidden space-y-3">
        {!orders?.length && <p className="text-center text-eco-gray py-12">Sipariş bulunamadı</p>}
        {orders?.map((o: any) => {
          const { label, variant } = statusBadge(o.status);
          return (
            <div key={o.id} className="bg-white rounded-xl border border-eco-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-eco-text">{o.customer?.name}</p>
                  <p className="text-xs text-eco-gray">{o.engineer?.name ?? '—'} · {o.order_number}</p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{formatCurrency(o.total_amount)}</span>
                <span className="text-eco-green font-semibold">+{o.total_points} puan</span>
              </div>
              <p className="text-xs text-eco-gray mt-2">{formatDate(o.created_at)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
