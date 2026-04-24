export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER', 'REMOTE_AGENT', 'CUSTOMER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('notifications')
    .update({ is_read: true })
    .eq('id', params.id)
    .eq('user_id', token.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER', 'REMOTE_AGENT', 'CUSTOMER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { error } = await supabaseServer
    .from('notifications')
    .delete()
    .eq('id', params.id)
    .eq('user_id', token.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
