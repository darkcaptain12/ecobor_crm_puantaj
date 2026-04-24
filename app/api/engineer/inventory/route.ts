export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('engineer_inventory')
    .select('*, product:products(name, unit, price)')
    .eq('engineer_id', token.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
