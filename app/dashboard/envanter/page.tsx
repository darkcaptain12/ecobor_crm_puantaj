import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EngineerEnvanter() {
  const session = await getServerSession(authOptions);
  const engineerId = (session?.user as any)?.id;

  const { data: stock } = await supabaseServer
    .from('engineer_inventory')
    .select('*, product:products(name, unit, price)')
    .eq('engineer_id', engineerId)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Araç Stoğum</h1>
      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Ürün', 'Birim', 'Mevcut Stok', 'Son Güncelleme'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {stock?.map((item: any) => (
                <tr key={item.id} className="hover:bg-eco-bg/50">
                  <td className="px-4 py-3 font-medium text-eco-text">{item.product?.name}</td>
                  <td className="px-4 py-3 text-eco-text-2">{item.product?.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${item.quantity < 5 ? 'text-eco-error' : 'text-eco-text'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(item.updated_at)}</td>
                </tr>
              ))}
              {!stock?.length && <tr><td colSpan={4} className="text-center py-10 text-eco-gray">Stok kaydı yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
