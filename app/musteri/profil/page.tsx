import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';
import { signOut } from 'next-auth/react';
import ProfileLogout from './ProfileLogout';
import { Phone, MapPin, Wheat, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const { data: customer } = await supabaseServer
    .from('customers')
    .select('name, phone, region, crop_type, planting_date, created_at')
    .eq('user_id', userId)
    .maybeSingle();

  const name = customer?.name ?? session?.user?.name;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl shadow-card border border-eco-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-eco-green flex items-center justify-center text-white text-xl font-bold">
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-lg font-bold text-eco-text">{name}</p>
            <p className="text-xs text-eco-gray">Müşteri</p>
          </div>
        </div>

        <div className="space-y-3">
          {customer?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-eco-gray flex-shrink-0" />
              <span className="text-eco-text-2">{customer.phone}</span>
            </div>
          )}
          {customer?.region && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-eco-gray flex-shrink-0" />
              <span className="text-eco-text-2">{customer.region}</span>
            </div>
          )}
          {customer?.crop_type && (
            <div className="flex items-center gap-3 text-sm">
              <Wheat className="w-4 h-4 text-eco-gray flex-shrink-0" />
              <span className="text-eco-text-2">{customer.crop_type}</span>
            </div>
          )}
          {customer?.planting_date && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-eco-gray flex-shrink-0" />
              <span className="text-eco-text-2">Ekim: {formatDate(customer.planting_date)}</span>
            </div>
          )}
          {customer?.created_at && (
            <p className="text-xs text-eco-gray pt-2">Üyelik: {formatDate(customer.created_at)}</p>
          )}
        </div>
      </div>

      <ProfileLogout />
    </div>
  );
}
