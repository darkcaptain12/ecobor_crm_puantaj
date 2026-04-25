import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import StatCard from '@/components/ui/StatCard';
import { Users, Calendar, CheckSquare, ShoppingBag, Leaf, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { getActiveStages, getUpcomingStages, priorityColor, priorityLabel } from '@/lib/crop-schedule';

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
    { data: myCustomers },
    { data: notifications },
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
    supabaseServer.from('customers')
      .select('id, name, crop_type, planting_date, region, status')
      .eq('assigned_to', engineerId)
      .not('planting_date', 'is', null),
    supabaseServer.from('notifications')
      .select('*')
      .eq('user_id', engineerId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Dönemsel müdahale hesaplama
  const seasonalAlerts: {
    customerId: string;
    customerName: string;
    cropType: string;
    stageName: string;
    description: string;
    products: string[];
    priority: 'critical' | 'high' | 'medium';
    daysLeft: number;
  }[] = [];

  const upcomingAlerts: {
    customerId: string;
    customerName: string;
    cropType: string;
    stageName: string;
    products: string[];
    startsInDays: number;
  }[] = [];

  for (const c of (myCustomers ?? []) as any[]) {
    const active = getActiveStages(c.crop_type, c.planting_date);
    for (const stage of active) {
      seasonalAlerts.push({
        customerId: c.id,
        customerName: c.name,
        cropType: c.crop_type,
        stageName: stage.label,
        description: stage.description,
        products: stage.products,
        priority: stage.priority,
        daysLeft: stage.daysLeft,
      });
    }
    const upcoming = getUpcomingStages(c.crop_type, c.planting_date, 14);
    for (const stage of upcoming) {
      upcomingAlerts.push({
        customerId: c.id,
        customerName: c.name,
        cropType: c.crop_type,
        stageName: stage.label,
        products: stage.products,
        startsInDays: stage.startsInDays,
      });
    }
  }

  // Kritikler önce
  seasonalAlerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.priority] - order[b.priority];
  });

  // Aylık satış özeti (son 6 ay)
  const { data: orderStats } = await supabaseServer
    .from('orders')
    .select('created_at, total_amount')
    .eq('engineer_id', engineerId)
    .gte('created_at', new Date(Date.now() - 180 * 86400_000).toISOString());

  const monthlyMap: Record<string, number> = {};
  for (const o of (orderStats ?? []) as any[]) {
    const month = o.created_at.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(o.total_amount);
  }
  const monthlySales = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({
      label: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      total,
    }));

  const maxSale = Math.max(...monthlySales.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-eco-text">Merhaba, {session?.user?.name} 👋</h1>
          <p className="text-sm text-eco-text-2 mt-0.5">{formatDate(new Date())}</p>
        </div>
        {notifications && notifications.length > 0 && (
          <Link href="/dashboard/bildirimler"
            className="flex items-center gap-2 bg-eco-warning/10 border border-eco-warning/30 text-eco-warning text-sm font-medium px-3 py-2 rounded-lg hover:bg-eco-warning/20 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            {notifications.length} bildirim
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Müşterilerim" value={customerCount ?? 0} icon={Users} color="green" />
        <StatCard title="Bugün Takip" value={todayFollowups?.length ?? 0} icon={Calendar} color="yellow" />
        <StatCard title="Açık Görev" value={myTasks?.length ?? 0} icon={CheckSquare} color="blue" />
        <StatCard title="Dönem Alarmı" value={seasonalAlerts.length} icon={Leaf} color="purple" />
      </div>

      {/* ─── Dönemsel Müdahale Alarmları ─── */}
      {seasonalAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Leaf className="w-4 h-4 text-eco-green" />
              Dönemsel Müdahale Gerektiren Müşteriler
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {seasonalAlerts.filter(a => a.priority === 'critical').length} kritik
            </span>
          </div>
          <div className="divide-y divide-eco-border">
            {seasonalAlerts.map((alert, i) => (
              <Link key={i} href={`/dashboard/musteriler/${alert.customerId}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-eco-bg transition-colors">
                <div className={`mt-0.5 px-2 py-1 rounded text-xs font-semibold border ${priorityColor[alert.priority]}`}>
                  {priorityLabel[alert.priority]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-eco-text">{alert.customerName}</p>
                    <span className="text-xs text-eco-gray">· {alert.cropType}</span>
                  </div>
                  <p className="text-xs text-eco-green font-medium mt-0.5">{alert.stageName}</p>
                  <p className="text-xs text-eco-gray mt-0.5">{alert.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {alert.products.map((p) => (
                      <span key={p} className="text-xs bg-eco-green/10 text-eco-green px-2 py-0.5 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-eco-gray">{alert.daysLeft} gün kaldı</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Yaklaşan Dönemler (14 gün) ─── */}
      {upcomingAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-eco-info" />
              14 Gün İçinde Başlayacak Dönemler
            </h2>
          </div>
          <div className="divide-y divide-eco-border">
            {upcomingAlerts.map((alert, i) => (
              <Link key={i} href={`/dashboard/musteriler/${alert.customerId}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-eco-bg transition-colors">
                <div className="w-10 h-10 bg-eco-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-eco-info">{alert.startsInDays}g</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-eco-text">{alert.customerName}
                    <span className="text-xs text-eco-gray ml-1">· {alert.cropType}</span>
                  </p>
                  <p className="text-xs text-eco-gray">{alert.stageName}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.products.map((p) => (
                      <span key={p} className="text-xs bg-eco-green/10 text-eco-green px-2 py-0.5 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-eco-info font-medium shrink-0">
                  {alert.startsInDays === 1 ? 'Yarın' : `${alert.startsInDays} gün`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aylık Satış Grafiği */}
        {monthlySales.length > 0 && (
          <div className="bg-white rounded-xl shadow-card border border-eco-border">
            <div className="p-5 border-b border-eco-border">
              <h2 className="font-semibold text-eco-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-eco-green" />
                Aylık Satışlarım
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-2 h-32">
                {monthlySales.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-eco-gray">
                      {m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total}
                    </span>
                    <div
                      className="w-full bg-eco-green rounded-t-sm transition-all"
                      style={{ height: `${Math.max((m.total / maxSale) * 88, 4)}px` }}
                    />
                    <span className="text-xs text-eco-gray">{m.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-eco-gray mt-3 text-center">
                Toplam: {formatCurrency(monthlySales.reduce((s, m) => s + m.total, 0))}
              </p>
            </div>
          </div>
        )}

        {/* Bugün Aranacaklar */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-eco-warning" />
              Bugün Aranacaklar
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
            {!todayFollowups?.length && (
              <p className="text-center text-eco-gray text-sm py-8">Bugün takip yok</p>
            )}
          </div>
        </div>

        {/* Açık Görevler */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-eco-info" />
              Açık Görevler
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
            {!myTasks?.length && (
              <p className="text-center text-eco-gray text-sm py-8">Açık görev yok</p>
            )}
          </div>
        </div>

        {/* Son Satışlar */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border">
          <div className="flex items-center justify-between p-5 border-b border-eco-border">
            <h2 className="font-semibold text-eco-text flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-eco-purple" />
              Son Satışlar
            </h2>
            <Link href="/dashboard/satis" className="text-xs text-eco-green hover:underline">Tümü →</Link>
          </div>
          <div className="divide-y divide-eco-border">
            {recentOrders?.map((order: any) => {
              const { label, variant } = statusBadge(order.status);
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-eco-text">{order.customer?.name}</p>
                    <p className="text-xs text-eco-gray">{order.order_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-eco-text">{formatCurrency(order.total_amount)}</span>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              );
            })}
            {!recentOrders?.length && (
              <p className="text-center text-eco-gray text-sm py-8">Henüz satış yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
