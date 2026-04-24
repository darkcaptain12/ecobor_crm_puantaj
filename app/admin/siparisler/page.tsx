import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SiparislerPage({ searchParams }: { searchParams: { status?: string } }) {
  let query = supabaseServer
    .from('orders')
    .select('*, customer:customers(name, phone), engineer:users(name)')
    .order('created_at', { ascending: false });

  if (searchParams.status) query = query.eq('status', searchParams.status);

  const { data: orders } = await query;

  const statuses = ['NEW', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Siparişler</h1>

      <div className="flex gap-2 flex-wrap">
        <Link href="/admin/siparisler"
          className={`eco-btn text-xs px-3 py-1.5 ${!searchParams.status ? 'bg-eco-green text-white' : 'bg-white border border-eco-border text-eco-text-2'}`}>
          Tümü
        </Link>
        {statuses.map((s) => {
          const { label, variant } = statusBadge(s);
          return (
            <Link key={s} href={`/admin/siparisler?status=${s}`}
              className={`eco-btn text-xs px-3 py-1.5 ${searchParams.status === s ? 'bg-eco-green text-white' : 'bg-white border border-eco-border text-eco-text-2'}`}>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Sipariş No', 'Müşteri', 'Mühendis', 'Tutar', 'Puan', 'Durum', 'Tarih', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {orders?.map((o: any) => {
                const { label, variant } = statusBadge(o.status);
                return (
                  <tr key={o.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-mono text-xs text-eco-text">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-eco-text">{o.customer?.name}</p>
                      <p className="text-xs text-eco-gray">{o.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">{o.engineer?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-eco-text">{formatCurrency(o.total_amount)}</td>
                    <td className="px-4 py-3 text-eco-green font-semibold">{o.total_points}</td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/siparisler/${o.id}`} className="eco-btn-secondary text-xs px-3 py-1">Detay</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!orders?.length && <p className="text-center text-eco-gray py-12">Sipariş bulunamadı</p>}
        </div>
      </div>
    </div>
  );
}
