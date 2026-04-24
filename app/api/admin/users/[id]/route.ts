export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseServer
    .from('users')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('id, name, phone, role, is_active')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
