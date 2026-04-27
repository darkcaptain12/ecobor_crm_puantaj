import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Plus, MapPin, Wheat, Phone, Award, Eye, Lock, Upload, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { value: '', label: 'Tümü' },
  { value: 'yeni', label: 'Yeni' },
  { value: 'eski', label: 'Eski' },
  { value: 'onemli', label: 'Önemli' },
  { value: 'potansiyel', label: 'Potansiyel' },
];

export default async function EngineerMusteriler({
  searchParams,
}: {
  searchParams: { q?: string; region?: string; crop_type?: string; view?: string; status?: string };
}) {
  const session = await getServerSession(authOptions);
  const engineerId = (session?.user as any)?.id;

  const viewMode = searchParams.view === 'all' ? 'all' : 'mine';
  const activeStatus = searchParams.status ?? '';

  let query = supabaseServer
    .from('customers')
    .select('*, assigned_user:users!assigned_to(name)')
    .order('updated_at', { ascending: false });

  if (viewMode === 'mine') {
    query = query.eq('assigned_to', engineerId);
  }

  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%`);
  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.crop_type) query = query.ilike('crop_type', `%${searchParams.crop_type}%`);
  if (activeStatus) query = query.eq('status', activeStatus);

  const { data: customers } = await query;

  const myCount = viewMode === 'all'
    ? (customers ?? []).filter((c: any) => c.assigned_to === engineerId).length
    : customers?.length ?? 0;

  // Export URL with current filters
  function buildExportUrl() {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.region) params.set('region', searchParams.region);
    if (searchParams.crop_type) params.set('crop', searchParams.crop_type);
    if (activeStatus) params.set('status', activeStatus);
    const str = params.toString();
    return `/api/engineer/customers/export${str ? `?${str}` : ''}`;
  }

  // Base URL for tab/filter links
  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (viewMode === 'all') params.set('view', 'all');
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.region) params.set('region', searchParams.region);
    if (searchParams.crop_type) params.set('crop_type', searchParams.crop_type);
    if (activeStatus) params.set('status', activeStatus);
    Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    const str = params.toString();
    return `/dashboard/musteriler${str ? `?${str}` : ''}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-eco-text">
            {viewMode === 'mine' ? `Müşterilerim (${customers?.length ?? 0})` : `Ortak Müşteri Havuzu (${customers?.length ?? 0})`}
          </h1>
          {viewMode === 'all' && (
            <p className="text-xs text-eco-gray mt-0.5">
              {myCount} müşteri size atandı · Diğerleri sadece görüntülenebilir
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={buildUrl({ view: viewMode === 'mine' ? 'all' : '' })}
            className="eco-btn-secondary text-sm px-3 py-2 flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {viewMode === 'mine' ? 'Ortak Havuz' : 'Müşterilerim'}
          </Link>
          <a href={buildExportUrl()} className="eco-btn-secondary text-sm px-3 py-2 flex items-center gap-1 bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
            <Download className="w-4 h-4" /> Excel İndir
          </a>
          <Link href="/dashboard/import" className="eco-btn-secondary text-sm px-3 py-2 flex items-center gap-1">
            <Upload className="w-4 h-4" /> Veri Aktar
          </Link>
          <Link href="/dashboard/musteriler/yeni" className="eco-btn-primary">
            <Plus className="w-4 h-4" /> Yeni Müşteri
          </Link>
        </div>
      </div>

      {/* Durum filtre sekmeleri */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildUrl({ status: tab.value })}
            className={`eco-btn text-xs px-3 py-1.5 ${
              activeStatus === tab.value
                ? 'bg-eco-green text-white'
                : 'bg-white border border-eco-border text-eco-gray hover:border-eco-green hover:text-eco-green'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Arama formu */}
      <form method="get" className="flex flex-wrap gap-3">
        {viewMode === 'all' && <input type="hidden" name="view" value="all" />}
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input name="q" defaultValue={searchParams.q} placeholder="İsim veya telefon..." className="eco-input w-56" />
        <input name="region" defaultValue={searchParams.region} placeholder="Şehir / Bölge..." className="eco-input w-36" />
        <input name="crop_type" defaultValue={searchParams.crop_type} placeholder="Bitki türü..." className="eco-input w-36" />
        <button type="submit" className="eco-btn-primary px-4">Ara</button>
        <Link href={buildUrl({ q: '', region: '', crop_type: '' })} className="eco-btn-secondary px-4">Temizle</Link>
      </form>

      {/* Müşteri kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map((c: any) => {
          const { label, variant } = statusBadge(c.status);
          const isMyCustomer = c.assigned_to === engineerId;
          const href = isMyCustomer
            ? `/dashboard/musteriler/${c.id}`
            : `/dashboard/musteriler/${c.id}?readonly=1`;
          const cropTags = c.crop_type ? c.crop_type.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

          return (
            <Link key={c.id} href={href}
              className={`bg-white rounded-xl shadow-card border p-4 hover:shadow-card-hover transition-shadow relative ${
                isMyCustomer ? 'border-eco-border' : 'border-dashed border-eco-border opacity-80'
              }`}>
              {!isMyCustomer && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-eco-gray bg-eco-bg px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />{c.assigned_user?.name ?? 'Atanmamış'}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-eco-text">{c.name}</p>
                  <p className="text-xs text-eco-gray flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{c.phone}
                  </p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <div className="space-y-1 text-xs text-eco-text-2">
                {c.region && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</p>}
                {cropTags.length > 0 && (
                  <p className="flex items-center gap-1 flex-wrap">
                    <Wheat className="w-3 h-3 shrink-0" />
                    {cropTags.map((tag: string, i: number) => (
                      <span key={i} className="bg-eco-bg px-1.5 py-0.5 rounded text-[10px]">{tag}</span>
                    ))}
                  </p>
                )}
                {c.sales_status && (
                  <p className="text-[10px] text-eco-gray truncate">📋 {c.sales_status}</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-eco-border flex items-center justify-between">
                <span className="flex items-center gap-1 text-eco-green text-sm font-semibold">
                  <Award className="w-4 h-4" />{c.total_points} puan
                </span>
                <span className="text-xs text-eco-gray">{formatDate(c.created_at)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {!customers?.length && (
        <div className="text-center py-16 text-eco-gray">
          <p className="text-4xl mb-3">👥</p>
          <p>Müşteri bulunamadı</p>
        </div>
      )}
    </div>
  );
}
