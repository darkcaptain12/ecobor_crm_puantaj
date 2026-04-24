import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import StatCard from '@/components/ui/StatCard';
import { Users, Calendar, CheckSquare, ShoppingBag } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const engineerId = (session?.user as any)?.id;

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: customerCount },
    { data: todayFollowups },
    { data: myTasks },
    { data: recentOrders },
  ] = await Promise.all([
    supabaseServer.from('customers').select('*', { count: 'exact', head: true }).eq('assigned_to', engineerId),
    supabaseServer.from('interactions')
      .select('*, customer:customers(name)')
      .gte('next_followup', today + 'T00:00:00')
      .lte('next_followup', today + 'T23:59:59')
      .eq('engineer_id', engineerId),
    supabaseServer.from('tasks')
      .select('*, customer:customers(name)')
      .eq('assigned_to', engineerId)
      .neq('status', 'done')
      .order('due_date'),
    supabaseServer.from('orders')
      .select('*, customer:customers(name)')
      .eq('engineer_id', engineerId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-eco-text">Merhaba, {session?.user?.name} 👋</h1>
        <p className="text-sm text-eco-text-2 mt-0.5">{formatDate(new Date())}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Müşterilerim" value={customerCount ?? 0} icon={Users} color="green" />
        <StatCard title="Bugün Takip" value={todayFollowups?.length ?? 0} icon={Calendar} color="yellow" />
        <StatCard title="Açık Görev" value={myTasks?.length ?? 0} icon={CheckSquare} color="blue" />
        <StatCard title="Son Satışlar" value={recentOrders?.length ?? 0} icon={ShoppingBag} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugün Aranacaklar */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-eco-warning" />Bugün Aranacaklar
            </h2>
          </div>
          <div className="divide-y divide-eco-border">
            {todayFollowups?.map((f: any) => (
              <Link key={f.id} href={`/dashboard/musteriler/${f.customer_id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-eco-bg">
                <div>
                  <p className="text-sm font-medium text-eco-text">{f.customer?.name}</p>
                  <p className="text-xs text-eco-gray">{formatDateTime(f.next_followup)}</p>
                </div>
                <span className="eco-badge bg-eco-warning/10 text-eco-warning">Takip</span>
              </Link>
            ))}
            {!todayFollowups?.length && <p className="text-center text-eco-gray text-sm py-8">Bugün takip yok</p>}
          </div>
        </div>

        {/* Açık Görevler */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-eco-info" />Açık Görevler
            </h2>
            <Link href="/dashboard/gorevler" className="text-xs text-eco-green hover:underline">Tümü →</Link>
          </div>
          <div className="divide-y divide-eco-border">
            {myTasks?.map((t: any) => {
              const { label, variant } = statusBadge(t.status);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-eco-text">{t.title}</p>
                    <p className="text-xs text-eco-gray">{t.customer?.name ?? 'Genel'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.due_date && <span className="text-xs text-eco-gray">{formatDate(t.due_date)}</span>}
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              );
            })}
            {!myTasks?.length && <p className="text-center text-eco-gray text-sm py-8">Açık görev yok</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
