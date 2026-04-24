'use client';

import { useState, useEffect } from 'react';
import { formatDateTime } from '@/lib/utils';
import { Bell, Check } from 'lucide-react';
import type { Notification } from '@/types/database';

const typeLabels: Record<string, string> = {
  crop_season: 'Ekin Sezonu',
  product_expiry: 'Ürün Bitiş',
  followup: 'Takip',
  task: 'Görev',
  general: 'Genel',
};

export default function BildirimlerPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications?all=1').then((r) => r.json()).then((d) => {
      setNotifications(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Bildirimler</h1>
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        {loading ? (
          <p className="text-center py-12 text-eco-gray">Yükleniyor...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center py-12 text-eco-gray">Bildirim yok</p>
        ) : (
          <div className="divide-y divide-eco-border">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-4 p-4 ${!n.is_read ? 'bg-eco-green-bg/30' : ''}`}>
                <div className="w-8 h-8 bg-eco-green-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-eco-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-eco-green bg-eco-green-bg px-2 py-0.5 rounded-full">
                      {typeLabels[n.type] ?? n.type}
                    </span>
                    {!n.is_read && <span className="w-2 h-2 bg-eco-green rounded-full" />}
                  </div>
                  <p className="text-sm font-medium text-eco-text">{n.title}</p>
                  {n.body && <p className="text-xs text-eco-text-2 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-eco-gray mt-1">{formatDateTime(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="text-eco-green hover:text-eco-green-dk">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
