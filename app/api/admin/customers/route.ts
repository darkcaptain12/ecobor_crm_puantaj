export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const region = searchParams.get('region');
  const crop_type = searchParams.get('crop_type');

  let query = supabaseServer.from('customers').select('*').order('created_at', { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  if (region) query = query.eq('region', region);
  if (crop_type) query = query.eq('crop_type', crop_type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ADMIN', 'ENGINEER']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { name, phone, region, crop_type, planting_date, status, notes, location_lat, location_lng } = body;

  if (!name || !phone) return NextResponse.json({ error: 'Ad ve telefon zorunludur' }, { status: 400 });

  const { data: existing } = await supabaseServer.from('customers').select('id').eq('phone', phone).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Bu telefon numarası zaten kayıtlı' }, { status: 409 });

  const { data, error } = await supabaseServer.from('customers').insert({
    name, phone, region: region || null, crop_type: crop_type || null,
    planting_date: planting_date || null, status: status || 'new',
    notes: notes || null, assigned_to: token.id,
    location_lat: location_lat ? parseFloat(location_lat) : null,
    location_lng: location_lng ? parseFloat(location_lng) : null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
