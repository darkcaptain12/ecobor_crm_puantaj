export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { customer_id, type, note, next_followup } = await req.json();
  if (!customer_id) return NextResponse.json({ error: 'customer_id zorunlu' }, { status: 400 });

  const { data, error } = await supabaseServer
    .from('interactions')
    .insert({
      customer_id, engineer_id: token.id, type: type || 'call',
      note: note || null,
      next_followup: next_followup || null,
    })
    .select('*, engineer:users(name)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Takip bildirimi oluştur
  if (next_followup) {
    await supabaseServer.from('notifications').insert({
      user_id: token.id,
      customer_id,
      type: 'followup',
      title: 'Müşteri Takip Hatırlatması',
      body: `${data.customer_id} müşterisi için takip zamanı geldi`,
      trigger_date: next_followup.split('T')[0],
    });
  }

  return NextResponse.json(data, { status: 201 });
}
