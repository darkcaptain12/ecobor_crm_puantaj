import { supabaseServer } from '@/lib/supabase-server';
import { formatDate, formatCurrency } from '@/lib/utils';
import Badge, { statusBadge } from '@/components/ui/Badge';
import CommissionActions from './CommissionActions';

export const dynamic = 'force-dynamic';

export default async function KomisyonlarPage() {
  const { data: commissions } = await supabaseServer
    .from('commissions')
    .select('*, agent:users!agent_id(name, phone), order:orders(order_number, total_amount)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Komisyon Yönetimi</h1>
      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Saha Temsilcisi', 'Sipariş', 'Sipariş Tutarı', 'Oran', 'Komisyon', 'Durum', 'Tarih', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {commissions?.map((c: any) => {
                const { label, variant } = statusBadge(c.status);
                return (
                  <tr key={c.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-medium text-eco-text">{c.agent?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.order?.order_number}</td>
                    <td className="px-4 py-3 text-eco-text-2">{formatCurrency(c.order?.total_amount ?? 0)}</td>
                    <td className="px-4 py-3 text-eco-text-2">%{c.rate}</td>
                    <td className="px-4 py-3 font-semibold text-eco-text">{formatCurrency(c.amount)}</td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      {c.status === 'pending' && <CommissionActions id={c.id} />}
                    </td>
                  </tr>
                );
              })}
              {!commissions?.length && (
                <tr><td colSpan={8} className="text-center py-12 text-eco-gray">Komisyon kaydı yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
