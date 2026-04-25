'use client';

import { useState, useEffect } from 'react';
import { formatDateTime } from '@/lib/utils';
import { Bell, Check } from 'lucide-react';

const typeLabels: Record<string, string> = {
  crop_season: 'Ekin Sezonu',
  product_expiry: 'Ürün Bitiş',
  followup: 'Takip',
  task: 'Görev',
  general: 'Genel',
};

export default function MudurBildirimler() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications?all=1').then((r) => r.json()).then((d) => {
      setNotifications(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications((p) => p.map((n: any) => n.id === id ? { ...n, is_read: true } : n));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Bildirimler</h1>
      <div className="bg-white rounded-xl shadow-card border border-eco-border divide-y divide-eco-border">
        {loading && <p className="text-center text-eco-gray py-10">Yükleniyor...</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-center text-eco-gray py-10">Bildirim yok</p>
        )}
        {notifications.map((n: any) => (
          <div key={n.id} className={`flex items-start gap-4 px-5 py-4 ${n.is_read ? 'opacity-60' : 'bg-eco-green-bg/30'}`}>
            <div className="w-8 h-8 bg-eco-green/10 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-eco-green" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-eco-text">{n.title}</p>
                <span className="text-xs bg-eco-bg text-eco-gray px-1.5 py-0.5 rounded">{typeLabels[n.type] ?? n.type}</span>
              </div>
              <p className="text-sm text-eco-text-2 mt-0.5">{n.body}</p>
              <p className="text-xs text-eco-gray mt-1">{formatDateTime(n.created_at)}</p>
            </div>
            {!n.is_read && (
              <button onClick={() => markRead(n.id)}
                className="shrink-0 p-1.5 rounded-lg bg-eco-green/10 hover:bg-eco-green/20 text-eco-green transition-colors">
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
