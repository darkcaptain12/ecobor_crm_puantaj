export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

const STATUS_MAP: Record<string, string> = {
  yeni: 'Yeni Müşteri',
  eski: 'Eski Müşteri',
  onemli: 'Önemli',
  potansiyel: 'Potansiyel',
};

export async function GET(req: NextRequest) {
  const token = await requireRole(req, ['ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') ?? searchParams.get('search');
  const status = searchParams.get('status');
  const region = searchParams.get('region');
  const crop = searchParams.get('crop') ?? searchParams.get('crop_type');
  const all = searchParams.get('all') === '1';

  let query = supabaseServer
    .from('customers')
    .select('name, phone, region, crop_type, status, sales_status, source, previous_sales_amount, notes, total_points, created_at, assigned_to, assigned_user:users!assigned_to(name)')
    .order('created_at', { ascending: false });

  if (!all) {
    if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    if (status) query = query.eq('status', status);
    if (region) query = query.ilike('region', `%${region}%`);
    if (crop) query = query.ilike('crop_type', `%${crop}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((c: any) => ({
    'AD SOYAD': c.name ?? '',
    'TELEFON': c.phone ?? '',
    'ŞEHİR': c.region ?? '',
    'BİTKİ TÜRLERİ': c.crop_type ?? '',
    'DURUM': STATUS_MAP[c.status] ?? c.status ?? '',
    'SATIŞ DURUMU': c.sales_status ?? '',
    'KAYNAK': c.source ?? '',
    'ÖNCEKİ SATIŞ (₺)': c.previous_sales_amount ?? '',
    'NOTLAR': c.notes ?? '',
    'TOPLAM PUAN': c.total_points ?? 0,
    'MÜHENDİS': (c.assigned_user as any)?.name ?? '',
    'KAYIT TARİHİ': c.created_at ? c.created_at.slice(0, 10) : '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Müşteriler');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="musteriler-${today}.xlsx"`,
    },
  });
}
