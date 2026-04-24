export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const [{ data: orders }, { data: customers }, { data: topCustomers }] = await Promise.all([
    supabaseServer.from('orders').select('total_amount, total_points, status, created_at'),
    supabaseServer.from('customers').select('region, crop_type, total_points'),
    supabaseServer.from('customers').select('name, total_points').order('total_points', { ascending: false }).limit(10),
  ]);

  const totalRevenue = orders?.reduce((s, o) => o.status !== 'CANCELLED' ? s + o.total_amount : s, 0) ?? 0;
  const totalPoints = orders?.reduce((s, o) => s + o.total_points, 0) ?? 0;

  return NextResponse.json({ totalRevenue, totalPoints, orders, customers, topCustomers });
}
