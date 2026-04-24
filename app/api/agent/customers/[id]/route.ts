export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['REMOTE_AGENT', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('customers')
    .select('id, name, phone, region, status, total_points, created_at')
    .eq('id', params.id)
    .eq('assigned_to', token.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Bulunamadı veya yetki yok' }, { status: 404 });
  return NextResponse.json(data);
}
