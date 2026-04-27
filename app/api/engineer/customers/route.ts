export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const status = searchParams.get('status');
  const customerId = searchParams.get('customer_id');

  let query = supabaseServer
    .from('customers')
    .select('*')
    .eq('assigned_to', token.id)
    .order('updated_at', { ascending: false });

  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (status) query = query.eq('status', status);
  if (customerId) query = query.eq('id', customerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(customerId ? (data?.[0] ?? null) : data);
}

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { name, phone } = body;
  if (!name || !phone) return NextResponse.json({ error: 'Ad ve telefon zorunludur' }, { status: 400 });

  const { data: existing } = await supabaseServer.from('customers').select('id').eq('phone', phone).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Bu telefon zaten kayıtlı' }, { status: 409 });

  const { data, error } = await supabaseServer.from('customers').insert({
    name,
    phone,
    region: body.region || null,
    crop_type: body.crop_type || null,
    planting_date: body.planting_date || null,
    notes: body.notes || null,
    status: body.status || 'yeni',
    source: body.source || null,
    sales_status: body.sales_status || null,
    previous_sales_amount: body.previous_sales_amount ? Number(body.previous_sales_amount) : null,
    assigned_to: token.id,
    total_points: 500,
    location_lat: body.location_lat ? parseFloat(body.location_lat) : null,
    location_lng: body.location_lng ? parseFloat(body.location_lng) : null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Hoşgeldin puan kaydı
  await supabaseServer.from('reward_logs').insert({
    customer_id: data.id,
    type: 'earn',
    points: 500,
    description: 'Hoşgeldin bonusu — üyelik puanı',
  });

  return NextResponse.json(data, { status: 201 });
}
