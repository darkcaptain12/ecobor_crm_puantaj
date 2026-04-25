import { supabaseServer } from '@/lib/supabase-server';
import InventoryActions from './InventoryActions';

export const dynamic = 'force-dynamic';

export default async function EnvanterPage() {
  const [
    { data: inventory },
    { data: engineerStock },
    { data: engineers },
    { data: products },
  ] = await Promise.all([
    supabaseServer.from('inventory').select('*, product:products(name, unit)').order('quantity'),
    supabaseServer.from('engineer_inventory')
      .select('*, product:products(name, unit), engineer:users!engineer_id(name)')
      .order('engineer_id'),
    supabaseServer.from('users')
      .select('id, name')
      .in('role', ['ENGINEER', 'REMOTE_AGENT'])
      .eq('is_active', true),
    supabaseServer.from('products').select('id, name, unit').eq('is_active', true),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Envanter Yönetimi</h1>
      <InventoryActions
        inventory={(inventory ?? []) as any[]}
        engineerStock={(engineerStock ?? []) as any[]}
        engineers={(engineers ?? []) as any[]}
        products={(products ?? []) as any[]}
      />
    </div>
  );
}
