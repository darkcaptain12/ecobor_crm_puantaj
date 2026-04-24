export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER', 'REMOTE_AGENT']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const update: any = { ...body };
  if (body.status === 'done') update.completed_at = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from('tasks').update(update).eq('id', params.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
