'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import { Users, TrendingUp, ShoppingBag, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function SahaDashboard() {
  const [stats, setStats] = useState<any>({});
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/agent/stats').then((r) => r.json()),
      fetch('/api/agent/commissions').then((r) => r.json()),
    ]).then(([s, c]) => { setStats(s ?? {}); setCommissions(Array.isArray(c) ? c.slice(0, 5) : []); });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-eco-text">Saha Temsilcisi Paneli</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Müşterilerim" value={stats.customerCount ?? 0} icon={Users} color="green" />
        <StatCard title="Toplam Satış" value={formatCurrency(stats.totalSales ?? 0)} icon={ShoppingBag} color="blue" />
        <StatCard title="Bekleyen Komisyon" value={formatCurrency(stats.pendingCommission ?? 0)} icon={TrendingUp} color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center justify-between p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Son Komisyonlar</h2>
          <Link href="/saha/komisyon" className="text-xs text-eco-green hover:underline">Tümü →</Link>
        </div>
        <div className="divide-y divide-eco-border">
          {commissions.map((c: any) => {
            const { label, variant } = statusBadge(c.status);
            return (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-eco-text">{c.order?.order_number}</p>
                  <p className="text-xs text-eco-gray">{formatDate(c.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-eco-text">{formatCurrency(c.amount)}</span>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </div>
            );
          })}
          {!commissions.length && <p className="text-center py-8 text-eco-gray">Komisyon kaydı yok</p>}
        </div>
      </div>
    </div>
  );
}
