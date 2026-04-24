import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import ProgressBar from '@/components/ui/ProgressBar';
import { Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MusteriAnaSayfa() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const { data: customer } = await supabaseServer
    .from('customers')
    .select('name, total_points')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: rules } = await supabaseServer
    .from('reward_rules')
    .select('*')
    .eq('is_active', true)
    .order('points_required');

  const totalPoints = customer?.total_points ?? 0;
  const eligibleRules = rules?.filter((r: any) => totalPoints >= r.points_required) ?? [];
  const nextRule = rules?.find((r: any) => r.points_required > totalPoints);

  const { data: recentLogs } = await supabaseServer
    .from('reward_logs')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="p-4 space-y-4">
      {/* Puan Kartı — puantaj.png referansına göre */}
      <div className="bg-eco-green rounded-2xl p-6 text-white shadow-soft">
        <p className="text-white/70 text-sm mb-1">{customer?.name ?? session?.user?.name}</p>
        <p className="text-5xl font-bold tracking-tight">
          {totalPoints.toLocaleString('tr-TR')}
        </p>
        <p className="text-white/70 text-sm mt-1">Puan</p>

        {eligibleRules.length > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl p-3">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">{eligibleRules.length} ödül hakkınız var!</span>
          </div>
        )}
      </div>

      {/* Sonraki Ödüle İlerleme */}
      {nextRule && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-eco-border">
          <p className="text-xs text-eco-gray mb-1">Bir Sonraki Hediyeniz</p>
          <p className="font-semibold text-eco-text">{nextRule.name} — {nextRule.reward_value}</p>
          <div className="mt-3">
            <ProgressBar
              value={totalPoints}
              max={nextRule.points_required}
              label={`${totalPoints} / ${nextRule.points_required} puan`}
              showPercent
            />
          </div>
          <p className="text-xs text-eco-text-2 mt-2">
            {(nextRule.points_required - totalPoints).toLocaleString('tr-TR')} puan daha kazanmanız gerekiyor
          </p>
        </div>
      )}

      {/* Tüm Ödül Seviyeleri */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-eco-border">
        <p className="font-semibold text-eco-text mb-3">Ödül Seviyeleri</p>
        <div className="space-y-3">
          {rules?.map((r: any) => {
            const achieved = totalPoints >= r.points_required;
            return (
              <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl ${achieved ? 'bg-eco-green-bg' : 'bg-eco-bg'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achieved ? 'bg-eco-green' : 'bg-eco-border'}`}>
                  <Award className={`w-4 h-4 ${achieved ? 'text-white' : 'text-eco-gray'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${achieved ? 'text-eco-green' : 'text-eco-text'}`}>{r.name}</p>
                  <p className="text-xs text-eco-text-2">{r.reward_value} • {r.points_required.toLocaleString('tr-TR')} puan</p>
                </div>
                {achieved && <span className="text-xs font-semibold text-eco-green">✓ Kazandı</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Son Puan Hareketleri */}
      {recentLogs && recentLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-eco-border">
          <p className="font-semibold text-eco-text mb-3">Son Hareketler</p>
          <div className="space-y-2">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between">
                <p className="text-sm text-eco-text-2 truncate flex-1">{log.description}</p>
                <span className={`text-sm font-bold ml-3 ${log.points > 0 ? 'text-eco-green' : 'text-eco-error'}`}>
                  {log.points > 0 ? '+' : ''}{log.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
