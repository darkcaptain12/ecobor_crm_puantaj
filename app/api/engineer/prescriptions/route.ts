export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const token = await requireRole(req, ['ENGINEER', 'ADMIN']);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { customer_id, diagnosis, usage_days, notes, items } = await req.json();
  if (!customer_id) return NextResponse.json({ error: 'customer_id zorunlu' }, { status: 400 });

  const { data: prescription, error: pError } = await supabaseServer
    .from('prescriptions')
    .insert({ customer_id, engineer_id: token.id, diagnosis: diagnosis || null, usage_days: usage_days || 7, notes: notes || null })
    .select()
    .single();

  if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

  if (items?.length) {
    const insertItems = items.filter((i: any) => i.product_id).map((i: any) => ({
      prescription_id: prescription.id,
      product_id: i.product_id,
      quantity: i.quantity,
    }));
    if (insertItems.length) {
      await supabaseServer.from('prescription_items').insert(insertItems);
    }
  }

  const { data: full } = await supabaseServer
    .from('prescriptions')
    .select('*, items:prescription_items(*, product:products(name, unit))')
    .eq('id', prescription.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}
