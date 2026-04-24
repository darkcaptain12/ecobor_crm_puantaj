export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { status } = await req.json();
  const update: any = { status };
  if (status === 'approved') {
    update.approved_by = token.id;
    update.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabaseServer
    .from('commissions').update(update).eq('id', params.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
