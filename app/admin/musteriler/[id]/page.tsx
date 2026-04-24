import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { MapPin, Wheat, Phone, Calendar, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MusteriDetay({ params }: { params: { id: string } }) {
  const [
    { data: customer },
    { data: interactions },
    { data: prescriptions },
    { data: orders },
    { data: rewardLogs },
  ] = await Promise.all([
    supabaseServer.from('customers').select('*, assigned_user:users!assigned_to(name, phone)').eq('id', params.id).maybeSingle(),
    supabaseServer.from('interactions').select('*, engineer:users(name)').eq('customer_id', params.id).order('date', { ascending: false }),
    supabaseServer.from('prescriptions').select('*, engineer:users(name), items:prescription_items(*, product:products(name, unit))').eq('customer_id', params.id).order('created_at', { ascending: false }),
    supabaseServer.from('orders').select('*').eq('customer_id', params.id).order('created_at', { ascending: false }),
    supabaseServer.from('reward_logs').select('*').eq('customer_id', params.id).order('created_at', { ascending: false }).limit(20),
  ]);

  if (!customer) notFound();

  const { label, variant } = statusBadge(customer.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/musteriler" className="text-eco-gray hover:text-eco-text">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-eco-text">{customer.name}</h1>
        <Badge variant={variant}>{label}</Badge>
      </div>

      {/* Müşteri Bilgileri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Müşteri Bilgileri</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-eco-gray" />
              <span className="text-eco-text-2">{customer.phone}</span>
            </div>
            {customer.region && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-eco-gray" />
                <span className="text-eco-text-2">{customer.region}</span>
              </div>
            )}
            {customer.crop_type && (
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-eco-gray" />
                <span className="text-eco-text-2">{customer.crop_type}</span>
              </div>
            )}
            {customer.planting_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-eco-gray" />
                <span className="text-eco-text-2">Ekim: {formatDate(customer.planting_date)}</span>
              </div>
            )}
            {customer.notes && (
              <p className="text-eco-text-2 text-xs bg-eco-bg p-2 rounded-lg mt-2">{customer.notes}</p>
            )}
          </dl>
        </div>

        <div className="bg-eco-green rounded-xl p-5 text-white">
          <p className="text-sm text-white/70">Toplam Puan</p>
          <p className="text-4xl font-bold mt-1">{customer.total_points.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-white/70 mt-2">Atanan: {customer.assigned_user?.name ?? '—'}</p>
          <p className="text-xs text-white/70">Kayıt: {formatDate(customer.created_at)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-3">Son Siparişler</h2>
          <div className="space-y-2">
            {orders?.slice(0, 4).map((o: any) => {
              const { label: sl, variant: sv } = statusBadge(o.status);
              return (
                <Link key={o.id} href={`/admin/siparisler/${o.id}`} className="flex items-center justify-between text-sm hover:bg-eco-bg p-1.5 rounded-lg">
                  <span className="text-eco-text-2">{o.order_number}</span>
                  <Badge variant={sv}>{sl}</Badge>
                </Link>
              );
            })}
            {!orders?.length && <p className="text-xs text-eco-gray">Sipariş yok</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Etkileşim Timeline */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Etkileşim Geçmişi</h2>
          <div className="relative pl-6 space-y-4">
            {interactions?.map((i: any, idx) => {
              const colors: any = { call: 'bg-eco-green', visit: 'bg-eco-info', note: 'bg-eco-warning' };
              const labels: any = { call: 'Arama', visit: 'Ziyaret', note: 'Not' };
              return (
                <div key={i.id} className="relative">
                  {idx < (interactions?.length ?? 0) - 1 && (
                    <div className="absolute left-[-19px] top-5 bottom-[-16px] w-0.5 bg-eco-border" />
                  )}
                  <div className={`absolute left-[-23px] top-1 w-3 h-3 rounded-full ${colors[i.type] ?? 'bg-eco-gray'}`} />
                  <div className="bg-eco-bg rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-eco-text">{labels[i.type]}</span>
                      <span className="text-xs text-eco-gray">{formatDateTime(i.date)}</span>
                      <span className="text-xs text-eco-text-2 ml-auto">{i.engineer?.name}</span>
                    </div>
                    {i.note && <p className="text-sm text-eco-text-2">{i.note}</p>}
                    {i.next_followup && (
                      <p className="text-xs text-eco-warning mt-1">Takip: {formatDateTime(i.next_followup)}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {!interactions?.length && <p className="text-sm text-eco-gray">Etkileşim kaydı yok</p>}
          </div>
        </div>

        {/* Reçeteler */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4">Reçeteler</h2>
          <div className="space-y-3">
            {prescriptions?.map((p: any) => (
              <div key={p.id} className="border border-eco-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-eco-text">{formatDate(p.date)}</span>
                  <span className="text-xs text-eco-text-2">{p.engineer?.name} · {p.usage_days} gün</span>
                </div>
                {p.diagnosis && <p className="text-xs text-eco-text-2 mb-2">{p.diagnosis}</p>}
                <div className="space-y-1">
                  {p.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-eco-text">{item.product?.name}</span>
                      <span className="text-eco-text-2">{item.quantity} {item.unit ?? item.product?.unit}</span>
                      {item.expiry_date && <span className="text-eco-warning">Bitiş: {formatDate(item.expiry_date)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!prescriptions?.length && <p className="text-sm text-eco-gray">Reçete yok</p>}
          </div>
        </div>
      </div>

      {/* Puan Geçmişi */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
        <h2 className="font-semibold text-eco-text mb-4">Puan Geçmişi</h2>
        <div className="space-y-2">
          {rewardLogs?.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-eco-border/50">
              <span className="text-eco-text-2">{log.description}</span>
              <span className="text-xs text-eco-gray">{formatDate(log.created_at)}</span>
              <span className={`font-semibold ${log.points > 0 ? 'text-eco-green' : 'text-eco-error'}`}>
                {log.points > 0 ? '+' : ''}{log.points}
              </span>
            </div>
          ))}
          {!rewardLogs?.length && <p className="text-sm text-eco-gray">Puan hareketi yok</p>}
        </div>
      </div>
    </div>
  );
}
