import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Plus, MapPin, Wheat, Phone, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EngineerMusteriler({ searchParams }: { searchParams: { q?: string; region?: string; crop_type?: string } }) {
  const session = await getServerSession(authOptions);
  const engineerId = (session?.user as any)?.id;

  let query = supabaseServer
    .from('customers')
    .select('*')
    .eq('assigned_to', engineerId)
    .order('updated_at', { ascending: false });

  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%`);
  if (searchParams.region) query = query.eq('region', searchParams.region);
  if (searchParams.crop_type) query = query.eq('crop_type', searchParams.crop_type);

  const { data: customers } = await query;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-eco-text">Müşterilerim ({customers?.length ?? 0})</h1>
        <Link href="/dashboard/musteriler/yeni" className="eco-btn-primary">
          <Plus className="w-4 h-4" />Yeni Müşteri
        </Link>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={searchParams.q} placeholder="İsim veya telefon..." className="eco-input w-56" />
        <input name="region" defaultValue={searchParams.region} placeholder="Bölge..." className="eco-input w-36" />
        <input name="crop_type" defaultValue={searchParams.crop_type} placeholder="Ekin türü..." className="eco-input w-36" />
        <button type="submit" className="eco-btn-primary px-4">Ara</button>
        <Link href="/dashboard/musteriler" className="eco-btn-secondary px-4">Temizle</Link>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map((c: any) => {
          const { label, variant } = statusBadge(c.status);
          return (
            <Link key={c.id} href={`/dashboard/musteriler/${c.id}`}
              className="bg-white rounded-xl shadow-card border border-eco-border p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-eco-text">{c.name}</p>
                  <p className="text-xs text-eco-gray flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{c.phone}</p>
                </div>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <div className="space-y-1 text-xs text-eco-text-2">
                {c.region && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.region}</p>}
                {c.crop_type && <p className="flex items-center gap-1"><Wheat className="w-3 h-3" />{c.crop_type}</p>}
                {c.planting_date && <p>Ekim: {formatDate(c.planting_date)}</p>}
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
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Müşteri bulunamadı</p>
        </div>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
