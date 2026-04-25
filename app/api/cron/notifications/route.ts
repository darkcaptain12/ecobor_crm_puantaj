export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getActiveStages, getUpcomingStages } from '@/lib/crop-schedule';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const in3Days = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
  const in7Days = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const results: string[] = [];

  // ─── 1. Takip bildirimleri (mühendise) ────────────────────────────────────
  {
    const { data } = await supabaseServer
      .from('interactions')
      .select('id, engineer_id, customer_id, customer:customers(name)')
      .lte('next_followup', `${today}T23:59:59Z`)
      .gte('next_followup', `${today}T00:00:00Z`);

    if (data?.length) {
      const notifs = (data as any[]).map((f) => ({
        user_id: f.engineer_id,
        customer_id: f.customer_id,
        type: 'followup',
        title: `Takip Zamanı: ${f.customer?.name}`,
        body: `${f.customer?.name} ile bugün takip görüşmesi yapılması planlanıyordu.`,
        trigger_date: today,
      }));
      await supabaseServer.from('notifications').insert(notifs);
      results.push(`${notifs.length} takip bildirimi`);
    }
  }

  // ─── 2. Reçete bitiş — mühendise + müşteriye ──────────────────────────────
  {
    const { data } = await supabaseServer
      .from('prescription_items')
      .select(`
        id, expiry_date,
        prescription:prescriptions(
          id, usage_days, customer_id, engineer_id,
          customer:customers(name, user_id),
          items:prescription_items(product:products(name))
        )
      `)
      .lte('expiry_date', in3Days)
      .gte('expiry_date', today);

    if (data?.length) {
      const seen = new Set<string>();
      const notifs: any[] = [];

      for (const item of data as any[]) {
        const p = item.prescription;
        if (!p) continue;
        const key = `${p.customer_id}-${p.engineer_id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const productNames = [...new Set(
          (p.items ?? []).map((i: any) => i.product?.name).filter(Boolean)
        )].join(', ');

        notifs.push({
          user_id: p.engineer_id,
          customer_id: p.customer_id,
          type: 'product_expiry',
          title: `Reçete Bitiyor: ${p.customer?.name}`,
          body: `${p.customer?.name} reçetesi ${item.expiry_date} tarihinde bitiyor. (${productNames})`,
          trigger_date: today,
        });

        if (p.customer?.user_id) {
          notifs.push({
            user_id: p.customer.user_id,
            customer_id: p.customer_id,
            type: 'product_expiry',
            title: 'Uygulama Süresi Doluyor',
            body: `${productNames} uygulama süresi ${item.expiry_date} tarihinde doluyor. Danışmanınızla iletişime geçin.`,
            trigger_date: today,
          });
        }
      }

      if (notifs.length) {
        await supabaseServer.from('notifications').insert(notifs);
        results.push(`${notifs.length} reçete bitiş bildirimi`);
      }
    }
  }

  // ─── 3. Dönemsel uygulama alarmları (crop-schedule'dan) ───────────────────
  {
    const { data: customers } = await supabaseServer
      .from('customers')
      .select('id, name, crop_type, planting_date, assigned_to, user_id')
      .not('planting_date', 'is', null)
      .not('crop_type', 'is', null);

    if (customers?.length) {
      const notifs: any[] = [];

      for (const c of customers as any[]) {
        // Aktif dönemler — her sabah hatırlat (sadece dönem başlangıcında)
        const active = getActiveStages(c.crop_type, c.planting_date);
        for (const stage of active) {
          // Sadece dönemin ilk günü bildirim gönder
          if (stage.daysLeft !== stage.dayTo - stage.dayFrom) continue;

          if (c.assigned_to) {
            notifs.push({
              user_id: c.assigned_to,
              customer_id: c.id,
              type: 'crop_season',
              title: `${stage.label} Dönemi: ${c.name}`,
              body: `${c.name} (${c.crop_type}) — ${stage.label} dönemi başladı. ${stage.description} Önerilen: ${stage.products.join(', ')}`,
              trigger_date: today,
            });
          }

          if (c.user_id) {
            notifs.push({
              user_id: c.user_id,
              customer_id: c.id,
              type: 'crop_season',
              title: `${stage.label} Bakım Zamanı`,
              body: `${c.crop_type} için ${stage.label} dönemi başladı. ${stage.description}`,
              trigger_date: today,
            });
          }
        }

        // Yaklaşan dönemler — 7 gün öncesinde uyar
        const upcoming = getUpcomingStages(c.crop_type, c.planting_date, 7);
        for (const stage of upcoming) {
          if (stage.startsInDays !== 7) continue; // sadece tam 7 gün kaldığında

          if (c.assigned_to) {
            notifs.push({
              user_id: c.assigned_to,
              customer_id: c.id,
              type: 'crop_season',
              title: `7 Gün Sonra: ${stage.label} — ${c.name}`,
              body: `${c.name} (${c.crop_type}) için ${stage.label} dönemi 7 gün sonra başlıyor. Hazırlık yapın: ${stage.products.join(', ')}`,
              trigger_date: today,
            });
          }
        }
      }

      if (notifs.length) {
        await supabaseServer.from('notifications').insert(notifs);
        results.push(`${notifs.length} dönemsel alarm bildirimi`);
      }
    }
  }

  // ─── 4. Reçete biteli 7 gün — yeniden uygulama hatırlatması ──────────────
  {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

    const { data: expiredPresc } = await supabaseServer
      .from('prescriptions')
      .select(`
        id, customer_id, engineer_id,
        customer:customers(name, user_id),
        items:prescription_items(product:products(name))
      `)
      .lt('date', sevenDaysAgo);

    if (expiredPresc?.length) {
      const { data: recentPresc } = await supabaseServer
        .from('prescriptions')
        .select('customer_id')
        .gte('date', sevenDaysAgo);

      const recentCustomers = new Set((recentPresc ?? []).map((p: any) => p.customer_id));
      const seen = new Set<string>();
      const notifs: any[] = [];

      for (const p of expiredPresc as any[]) {
        if (recentCustomers.has(p.customer_id) || seen.has(p.customer_id)) continue;
        seen.add(p.customer_id);

        const productNames = [...new Set(
          (p.items ?? []).map((i: any) => i.product?.name).filter(Boolean)
        )].join(', ');

        notifs.push({
          user_id: p.engineer_id,
          customer_id: p.customer_id,
          type: 'crop_season',
          title: `Yeniden Uygulama: ${p.customer?.name}`,
          body: `${p.customer?.name} son reçetesi 7+ gün önce bitti. Yeni uygulama planlanabilir. (${productNames})`,
          trigger_date: today,
        });

        if (p.customer?.user_id) {
          notifs.push({
            user_id: p.customer.user_id,
            customer_id: p.customer_id,
            type: 'crop_season',
            title: 'Tekrar Uygulama Zamanı',
            body: `${productNames} uygulamasını yineleme zamanı. Tarım danışmanınız sizi yakında ziyaret edecek.`,
            trigger_date: today,
          });
        }
      }

      if (notifs.length) {
        await supabaseServer.from('notifications').insert(notifs);
        results.push(`${notifs.length} yeniden uygulama hatırlatması`);
      }
    }
  }

  // ─── 5. Görev hatırlatması (7 gün kalan) ─────────────────────────────────
  {
    const { data: tasks } = await supabaseServer
      .from('tasks')
      .select('id, title, assigned_to, customer_id, customer:customers(name)')
      .eq('due_date', in7Days)
      .eq('status', 'pending');

    if (tasks?.length) {
      const notifs = (tasks as any[]).map((t) => ({
        user_id: t.assigned_to,
        customer_id: t.customer_id,
        type: 'task',
        title: `Görev Hatırlatma: ${t.title}`,
        body: `"${t.title}" görevi 7 gün içinde tamamlanmalı.${t.customer?.name ? ` Müşteri: ${t.customer.name}` : ''}`,
        trigger_date: today,
      }));
      await supabaseServer.from('notifications').insert(notifs);
      results.push(`${notifs.length} görev hatırlatması`);
    }
  }

  return NextResponse.json({ success: true, date: today, results });
}
