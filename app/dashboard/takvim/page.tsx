import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { formatDateTime, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Phone, MapPin, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TakvimPage() {
  const session = await getServerSession(authOptions);
  const engineerId = (session?.user as any)?.id;
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const { data: todayFollowups } = await supabaseServer
    .from('interactions')
    .select('*, customer:customers(id, name, phone, region, crop_type)')
    .eq('engineer_id', engineerId)
    .gte('next_followup', today + 'T00:00:00')
    .lte('next_followup', today + 'T23:59:59')
    .order('next_followup');

  const { data: weekFollowups } = await supabaseServer
    .from('interactions')
    .select('*, customer:customers(id, name, phone, region)')
    .eq('engineer_id', engineerId)
    .gte('next_followup', today + 'T00:00:01')
    .lte('next_followup', nextWeek + 'T23:59:59')
    .order('next_followup');

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Takvim & Takip</h1>

      {/* Bugün */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center gap-2 p-5 border-b border-eco-border">
          <Phone className="w-4 h-4 text-eco-error" />
          <h2 className="font-semibold text-eco-text">Bugün Aranacaklar ({todayFollowups?.length ?? 0})</h2>
        </div>
        {todayFollowups?.length ? (
          <div className="divide-y divide-eco-border">
            {todayFollowups.map((f: any) => (
              <Link key={f.id} href={`/dashboard/musteriler/${f.customer?.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-eco-green-bg/30 transition-colors">
                <div>
                  <p className="font-semibold text-eco-text">{f.customer?.name}</p>
                  <div className="flex items-center gap-3 text-xs text-eco-text-2 mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{f.customer?.phone}</span>
                    {f.customer?.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.customer?.region}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-eco-warning">{formatDateTime(f.next_followup)}</p>
                  <p className="text-xs text-eco-gray truncate max-w-32">{f.note}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-eco-gray py-10">Bugün takip yok 🎉</p>
        )}
      </div>

      {/* Bu Hafta */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center gap-2 p-5 border-b border-eco-border">
          <Calendar className="w-4 h-4 text-eco-info" />
          <h2 className="font-semibold text-eco-text">Bu Hafta ({weekFollowups?.length ?? 0})</h2>
        </div>
        {weekFollowups?.length ? (
          <div className="divide-y divide-eco-border">
            {weekFollowups.map((f: any) => (
              <Link key={f.id} href={`/dashboard/musteriler/${f.customer?.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-eco-bg transition-colors">
                <div>
                  <p className="font-medium text-eco-text">{f.customer?.name}</p>
                  <p className="text-xs text-eco-gray">{f.customer?.region}</p>
                </div>
                <p className="text-sm text-eco-info">{formatDate(f.next_followup)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-eco-gray py-8">Bu hafta takip yok</p>
        )}
      </div>
    </div>
  );
}
