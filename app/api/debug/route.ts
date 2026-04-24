export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey ?? anonKey;

  // Env check
  if (!url || !key) {
    return NextResponse.json({ step: 'env', error: 'Missing env', url: url ?? 'MISSING', hasService: !!serviceKey, hasAnon: !!anonKey });
  }

  // Raw fetch test
  try {
    const pingRes = await fetch(`${url}/rest/v1/users?select=phone&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const pingText = await pingRes.text();
    return NextResponse.json({
      step: 'fetch',
      status: pingRes.status,
      body: pingText.slice(0, 200),
      url: url.slice(0, 40),
    });
  } catch (e: any) {
    // Try Supabase client as fallback
    try {
      const db = createClient(url, key);
      const { data, error } = await db.from('users').select('phone').limit(2);
      if (error) return NextResponse.json({ step: 'client', error: error.message });
      const row = data?.[0];
      const hashMatch = row ? await compare('ecobor2026', (await db.from('users').select('password').eq('phone', '05001234567').maybeSingle()).data?.password ?? '') : null;
      return NextResponse.json({ step: 'client_ok', phones: data?.map(u => u.phone), hashMatch });
    } catch (e2: any) {
      return NextResponse.json({ step: 'both_failed', fetchError: e.message, clientError: e2.message });
    }
  }
}
