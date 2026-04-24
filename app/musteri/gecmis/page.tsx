import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDateTime } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PuanGecmisi() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const { data: customer } = await supabaseServer
    .from('customers')
    .select('id, total_points')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: logs } = await supabaseServer
    .from('reward_logs')
    .select('*')
    .eq('customer_id', customer?.id ?? userId)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 space-y-4">
      {/* Özet */}
      <div className="bg-eco-green rounded-2xl p-5 text-white">
        <p className="text-white/70 text-sm">Toplam Puan</p>
        <p className="text-4xl font-bold mt-1">{(customer?.total_points ?? 0).toLocaleString('tr-TR')}</p>
      </div>

      {/* Geçmiş — puantaj.png referansına göre */}
      <div className="bg-white rounded-2xl shadow-card border border-eco-border overflow-hidden">
        <div className="p-4 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Puan Geçmişi</h2>
        </div>
        <div className="divide-y divide-eco-border">
          {logs?.map((log: any) => (
            <div key={log.id} className="flex items-center gap-3 p-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${log.points > 0 ? 'bg-eco-green-bg' : 'bg-red-50'}`}>
                {log.points > 0
                  ? <TrendingUp className="w-4 h-4 text-eco-green" />
                  : <TrendingDown className="w-4 h-4 text-eco-error" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-eco-text truncate">{log.description}</p>
                <p className="text-xs text-eco-gray mt-0.5">{formatDateTime(log.created_at)}</p>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ${log.points > 0 ? 'text-eco-green' : 'text-eco-error'}`}>
                {log.points > 0 ? '+' : ''}{log.points}
              </span>
            </div>
          ))}
          {!logs?.length && (
            <p className="text-center text-eco-gray py-12">Puan hareketi yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
