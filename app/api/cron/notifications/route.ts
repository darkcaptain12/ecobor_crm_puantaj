export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  const results: string[] = [];

  // 1. Follow-up bildirimleri
  const { data: followups } = await supabaseServer
    .from('interactions')
    .select('id, engineer_id, customer_id, customer:customers(name)')
    .lte('next_followup', `${today}T23:59:59Z`)
    .gte('next_followup', `${today}T00:00:00Z`);

  if (followups?.length) {
    const notifs = followups.map((f: any) => ({
      user_id: f.engineer_id,
      customer_id: f.customer_id,
      type: 'followup',
      title: 'Takip Zamanı',
      body: `${f.customer?.name} müşterisi ile takip görüşmesi yapılması gerekiyor.`,
      trigger_date: today,
    }));
    await supabaseServer.from('notifications').insert(notifs);
    results.push(`${notifs.length} followup bildirimi oluşturuldu`);
  }

  // 2. Reçete bitiş bildirimleri
  const { data: expiring } = await supabaseServer
    .from('prescription_items')
    .select('id, prescription:prescriptions(customer_id, engineer_id, customer:customers(name))')
    .lte('expiry_date', threeDaysLater)
    .gte('expiry_date', today);

  if (expiring?.length) {
    const seen = new Set<string>();
    const notifs: any[] = [];
    for (const item of expiring as any[]) {
      const key = `${item.prescription?.customer_id}-${item.prescription?.engineer_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        notifs.push({
          user_id: item.prescription?.engineer_id,
          customer_id: item.prescription?.customer_id,
          type: 'product_expiry',
          title: 'Reçete Bitiyor',
          body: `${item.prescription?.customer?.name} müşterisinin reçetesi 3 gün içinde bitiyor.`,
          trigger_date: today,
        });
      }
    }
    if (notifs.length) {
      await supabaseServer.from('notifications').insert(notifs);
      results.push(`${notifs.length} reçete bitiş bildirimi oluşturuldu`);
    }
  }

  return NextResponse.json({ success: true, results, date: today });
}
