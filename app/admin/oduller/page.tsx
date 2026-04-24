import { supabaseServer } from '@/lib/supabase-server';
import { Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OdullerPage() {
  const { data: rules } = await supabaseServer.from('reward_rules').select('*').order('points_required');

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Ödül Kuralları</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {rules?.map((rule: any) => (
          <div key={rule.id} className="bg-white rounded-xl shadow-card border border-eco-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-eco-green-bg rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-eco-green" />
              </div>
              <div>
                <p className="font-semibold text-eco-text">{rule.name}</p>
                <p className="text-xs text-eco-gray">{rule.is_active ? 'Aktif' : 'Pasif'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-eco-text-2">Gereken Puan</span>
                <span className="font-bold text-eco-green">{rule.points_required.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-eco-text-2">Ödül</span>
                <span className="font-bold text-eco-text">{rule.reward_value}</span>
              </div>
            </div>
            {rule.description && <p className="text-xs text-eco-text-2 mt-3 pt-3 border-t border-eco-border">{rule.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
