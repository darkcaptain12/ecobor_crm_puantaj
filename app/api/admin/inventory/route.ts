export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { data, error } = await supabaseServer
    .from('inventory')
    .select('*, product:products(name, unit)')
    .order('quantity');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { id, quantity, min_stock, add } = body;
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  // add=true ise mevcut miktara ekle, değilse üzerine yaz
  if (add && typeof quantity === 'number') {
    const { data: current } = await supabaseServer
      .from('inventory').select('quantity').eq('id', id).single();
    const newQty = (Number(current?.quantity) ?? 0) + quantity;
    const { data, error } = await supabaseServer
      .from('inventory')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, product:products(name, unit)')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (typeof quantity === 'number') updates.quantity = quantity;
  if (typeof min_stock === 'number') updates.min_stock = min_stock;

  const { data, error } = await supabaseServer
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select('*, product:products(name, unit)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Mühendis stoğunu güncelle
export async function PUT(req: NextRequest) {
  const token = await requireAdmin(req);
  if (!token) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { engineer_id, product_id, quantity, add } = body;
  if (!engineer_id || !product_id) return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });

  if (add && typeof quantity === 'number') {
    const { data: current } = await supabaseServer
      .from('engineer_inventory')
      .select('quantity')
      .eq('engineer_id', engineer_id)
      .eq('product_id', product_id)
      .single();
    const newQty = (Number(current?.quantity) ?? 0) + quantity;
    const { data, error } = await supabaseServer
      .from('engineer_inventory')
      .upsert({ engineer_id, product_id, quantity: newQty, updated_at: new Date().toISOString() },
               { onConflict: 'engineer_id,product_id' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseServer
    .from('engineer_inventory')
    .upsert({ engineer_id, product_id, quantity, updated_at: new Date().toISOString() },
             { onConflict: 'engineer_id,product_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
