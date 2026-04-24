import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import ProgressBar from '@/components/ui/ProgressBar';
import { Award, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OdullerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const { data: customer } = await supabaseServer
    .from('customers')
    .select('total_points')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: rules } = await supabaseServer
    .from('reward_rules')
    .select('*')
    .eq('is_active', true)
    .order('points_required');

  const totalPoints = customer?.total_points ?? 0;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-eco-green rounded-2xl p-5 text-white">
        <p className="text-white/70 text-sm">Mevcut Puanınız</p>
        <p className="text-4xl font-bold mt-1">{totalPoints.toLocaleString('tr-TR')}</p>
      </div>

      <div className="space-y-3">
        {rules?.map((rule: any) => {
          const achieved = totalPoints >= rule.points_required;
          const progress = Math.min(100, (totalPoints / rule.points_required) * 100);

          return (
            <div key={rule.id} className={`bg-white rounded-2xl shadow-card border p-5 ${achieved ? 'border-eco-green' : 'border-eco-border'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${achieved ? 'bg-eco-green' : 'bg-eco-green-bg'}`}>
                  {achieved
                    ? <Check className="w-6 h-6 text-white" />
                    : <Award className="w-6 h-6 text-eco-green" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-eco-text">{rule.name}</h3>
                    {achieved && (
                      <span className="eco-badge bg-eco-green-bg text-eco-green text-[10px]">Hak Kazandı!</span>
                    )}
                  </div>
                  <p className="text-xs text-eco-text-2 mt-0.5">{rule.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-eco-text-2 mb-1">
                      <span>{totalPoints.toLocaleString()} / {rule.points_required.toLocaleString()} puan</span>
                      <span className="font-semibold text-eco-green">{rule.reward_value}</span>
                    </div>
                    <ProgressBar value={totalPoints} max={rule.points_required} />
                  </div>
                  {achieved && (
                    <div className="mt-3 p-3 bg-eco-green-bg rounded-xl text-center">
                      <p className="text-sm font-semibold text-eco-green">
                        🎁 {rule.reward_value} ödül hakkınızı kullanabilirsiniz!
                      </p>
                      <p className="text-xs text-eco-text-2 mt-0.5">Bayinizle iletişime geçin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
