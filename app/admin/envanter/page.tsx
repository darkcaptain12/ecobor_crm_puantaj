import { supabaseServer } from '@/lib/supabase-server';
import { formatDate } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EnvanterPage() {
  const [{ data: inventory }, { data: engineerStock }] = await Promise.all([
    supabaseServer.from('inventory').select('*, product:products(name, unit)').order('quantity'),
    supabaseServer.from('engineer_inventory')
      .select('*, product:products(name, unit), engineer:users!engineer_id(name)')
      .order('engineer_id'),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Envanter</h1>

      {/* Ana Depo */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Ana Depo Stoku</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Ürün', 'Miktar', 'Min. Stok', 'Durum', 'Güncelleme'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {inventory?.map((item: any) => {
                const low = item.quantity <= item.min_stock;
                return (
                  <tr key={item.id} className={`hover:bg-eco-bg/50 ${low ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-eco-text">{item.product?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${low ? 'text-eco-error' : 'text-eco-text'}`}>
                        {item.quantity} {item.product?.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">{item.min_stock} {item.product?.unit}</td>
                    <td className="px-4 py-3">
                      {low && (
                        <span className="flex items-center gap-1 text-eco-error text-xs">
                          <AlertTriangle className="w-3 h-3" />Düşük Stok
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(item.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mühendis Stokları */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Mühendis Araç Stokları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Mühendis', 'Ürün', 'Miktar', 'Güncelleme'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {engineerStock?.map((item: any) => (
                <tr key={item.id} className="hover:bg-eco-bg/50">
                  <td className="px-4 py-3 font-medium text-eco-text">{item.engineer?.name}</td>
                  <td className="px-4 py-3 text-eco-text-2">{item.product?.name}</td>
                  <td className="px-4 py-3 font-semibold text-eco-text">{item.quantity} {item.product?.unit}</td>
                  <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(item.updated_at)}</td>
                </tr>
              ))}
              {!engineerStock?.length && (
                <tr><td colSpan={4} className="text-center py-8 text-eco-gray">Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
