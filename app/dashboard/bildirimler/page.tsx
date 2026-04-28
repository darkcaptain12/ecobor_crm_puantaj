'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Calendar, Package, Info, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  crop_season: { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Mahsul Alarmı' },
  product_expiry: { icon: Package, color: 'text-red-600 bg-red-50 border-red-200', label: 'Reçete Bitiş' },
  followup: { icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Takip' },
  task: { icon: CheckCheck, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Görev' },
  general: { icon: Info, color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'Genel' },
};

export default function BildirimlerPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setNotifications(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function deleteNotif(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const unread = notifications.filter(n => !n.is_read);
  const read = notifications.filter(n => n.is_read);

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-eco-green border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-eco-text" />
          <h1 className="text-xl font-bold text-eco-text">Bildirimler</h1>
          {unread.length > 0 && (
            <span className="bg-eco-error text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread.length}</span>
          )}
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-eco-green hover:underline"
          >
            <CheckCheck className="w-4 h-4" />Tümünü okundu işaretle
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-eco-border p-12 text-center">
          <Bell className="w-10 h-10 text-eco-gray mx-auto mb-3 opacity-40" />
          <p className="text-eco-gray">Hiç bildirim yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Okunmamışlar */}
          {unread.length > 0 && (
            <div className="bg-white rounded-xl border border-eco-border overflow-hidden">
              <div className="px-4 py-2.5 bg-eco-bg border-b border-eco-border">
                <p className="text-xs font-semibold text-eco-gray uppercase tracking-wide">Okunmamış — {unread.length}</p>
              </div>
              <div className="divide-y divide-eco-border">
                {unread.map(n => <NotifRow key={n.id} n={n} onRead={markRead} onDelete={deleteNotif} />)}
              </div>
            </div>
          )}

          {/* Okunmuşlar */}
          {read.length > 0 && (
            <div className="bg-white rounded-xl border border-eco-border overflow-hidden opacity-70">
              <div className="px-4 py-2.5 bg-eco-bg border-b border-eco-border">
                <p className="text-xs font-semibold text-eco-gray uppercase tracking-wide">Okunmuş — {read.length}</p>
              </div>
              <div className="divide-y divide-eco-border">
                {read.map(n => <NotifRow key={n.id} n={n} onRead={markRead} onDelete={deleteNotif} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, onRead, onDelete }: { n: any; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${!n.is_read ? 'bg-eco-green/5' : ''}`}>
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${!n.is_read ? 'text-eco-text' : 'text-eco-gray'}`}>{n.title}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
        </div>
        {n.body && <p className="text-xs text-eco-text-2 mt-0.5">{n.body}</p>}
        <p className="text-[10px] text-eco-gray mt-1">{formatDateTime(n.created_at)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!n.is_read && (
          <button onClick={() => onRead(n.id)} title="Okundu işaretle" className="p-1 text-eco-green hover:bg-eco-green/10 rounded">
            <Check className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => onDelete(n.id)} title="Sil" className="p-1 text-eco-gray hover:text-red-500 hover:bg-red-50 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
