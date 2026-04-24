export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING';
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Test 1: genel internet bağlantısı
  let netOk = false;
  try { await fetch('https://httpbin.org/get', { signal: AbortSignal.timeout(5000) }); netOk = true; } catch {}

  // Test 2: Supabase health
  let supaStatus: number | string = 'n/a';
  try {
    const r = await fetch(`${url}/rest/v1/`, { signal: AbortSignal.timeout(8000) });
    supaStatus = r.status;
  } catch (e: any) { supaStatus = e.message; }

  return NextResponse.json({ url, hasService, hasAnon, netOk, supaStatus });
}
