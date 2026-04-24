'use client';

import { useEffect, useState } from 'react';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function KomisyonPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/commissions').then((r) => r.json()).then((d) => { setCommissions(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const total = commissions.reduce((s, c) => s + c.amount, 0);
  const approved = commissions.filter((c) => c.status === 'approved').reduce((s, c) => s + c.amount, 0);
  const pending = commissions.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Komisyonlarım</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam', value: total, color: 'text-eco-text' },
          { label: 'Onaylanan', value: approved, color: 'text-eco-green' },
          { label: 'Bekleyen', value: pending, color: 'text-eco-warning' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-card border border-eco-border p-4 text-center">
            <p className="text-xs text-eco-gray mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Sipariş', 'Oran', 'Komisyon', 'Durum', 'Tarih'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-eco-gray">Yükleniyor...</td></tr>
              ) : commissions.map((c: any) => {
                const { label, variant } = statusBadge(c.status);
                return (
                  <tr key={c.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-mono text-xs">{c.order?.order_number}</td>
                    <td className="px-4 py-3 text-eco-text-2">%{c.rate}</td>
                    <td className="px-4 py-3 font-semibold text-eco-text">{formatCurrency(c.amount)}</td>
                    <td className="px-4 py-3"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
