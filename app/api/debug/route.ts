export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return NextResponse.json({ error: 'Missing env', url: !!url, key: !!key });

  try {
    const db = createClient(url, key);
    const { data, error } = await db.from('users').select('id, phone, role').limit(3);
    if (error) return NextResponse.json({ error: error.message, hint: error.hint });

    const testHash = data?.[0] ? await compare('ecobor2026', (await db.from('users').select('password').eq('phone','05001234567').maybeSingle()).data?.password ?? '').catch(() => false) : null;
    return NextResponse.json({ ok: true, count: data?.length, phones: data?.map(u => u.phone), hashMatch: testHash });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
