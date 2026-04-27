export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';
import * as XLSX from 'xlsx';

// Telefon normalize: başına 0 ekle, boşlukları temizle
function normalizePhone(val: any): string {
  if (!val) return '';
  let str = String(val).replace(/\s/g, '').replace(/[^0-9]/g, '');
  if (str.length === 10) str = '0' + str; // 5XX → 05XX
  if (str.startsWith('90') && str.length === 12) str = '0' + str.slice(2); // 905XX → 05XX
  return str;
}

function mapStatus(val: any): string {
  if (!val) return 'yeni';
  const s = String(val).toLowerCase();
  if (s.includes('eski')) return 'eski';
  if (s.includes('yeni')) return 'yeni';
  return 'yeni';
}

function toIso(val: any): string | null {
  if (!val) return null;
  try {
    if (val instanceof Date) return val.toISOString();
    // Excel serial date number
    if (typeof val === 'number') {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return new Date(d.y, d.m - 1, d.d).toISOString();
    }
    const d = new Date(String(val));
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch { /* ignore */ }
  return null;
}

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  if (rows.length < 2) return NextResponse.json({ error: 'Dosyada veri bulunamadı' }, { status: 400 });

  // Sütun indeksleri (Excel formatı: 0=tarih, 1=AD SOYAD, 2=ŞEHİR, 3=TELEFON, 4=ESKİ/YENİ, 5=SATIŞ MİKTARI, 6=SATIŞ DURUMU, 7=KAYNAK, 8=NE GÖRÜŞÜLDÜ, 9=NOT, 10=HANGİ BİTKİ)
  const COL = { date: 0, name: 1, city: 2, phone: 3, type: 4, amount: 5, sales_status: 6, source: 7, discussion: 8, note: 9, crop: 10 };

  const inserted: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  // Batch size
  const BATCH = 100;
  const customers: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[COL.name] ? String(row[COL.name]).trim() : null;
    const phone = normalizePhone(row[COL.phone]);
    if (!name || !phone) continue;

    const notesParts = [row[COL.discussion], row[COL.note]].filter(Boolean).map(String);
    const notes = notesParts.join(' | ') || null;

    const createdAt = toIso(row[COL.date]);

    customers.push({
      name,
      phone,
      region: row[COL.city] ? String(row[COL.city]).trim() : null,
      crop_type: row[COL.crop] ? String(row[COL.crop]).trim() : null,
      status: mapStatus(row[COL.type]),
      sales_status: row[COL.sales_status] ? String(row[COL.sales_status]).trim() : null,
      source: row[COL.source] ? String(row[COL.source]).trim() : null,
      previous_sales_amount: row[COL.amount] ? parseFloat(String(row[COL.amount]).replace(/[^0-9.]/g, '')) || null : null,
      notes,
      assigned_to: (token as any).id,
      total_points: 500,
      ...(createdAt ? { created_at: createdAt } : {}),
    });
  }

  // Batch insert
  for (let i = 0; i < customers.length; i += BATCH) {
    const batch = customers.slice(i, i + BATCH);
    const { data, error } = await supabaseServer
      .from('customers')
      .upsert(batch, { onConflict: 'phone', ignoreDuplicates: true })
      .select('id, name, phone');

    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
    } else {
      (data ?? []).forEach((c: any) => inserted.push(c.name));
    }
  }

  // Welcome points for inserted customers (background)
  if (inserted.length > 0) {
    const { data: newCustomers } = await supabaseServer
      .from('customers')
      .select('id')
      .eq('assigned_to', (token as any).id)
      .in('name', inserted.slice(0, 1000));

    if (newCustomers?.length) {
      const logs = newCustomers.map((c: any) => ({
        customer_id: c.id,
        type: 'earn',
        points: 500,
        description: 'Hoşgeldin bonusu — üyelik puanı',
      }));
      await supabaseServer.from('reward_logs').upsert(logs, { ignoreDuplicates: true });
    }
  }

  return NextResponse.json({
    success: true,
    total: customers.length,
    inserted: inserted.length,
    skipped: customers.length - inserted.length - errors.length,
    errors,
  });
}
