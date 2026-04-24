'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types/database';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []));
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-eco-gray hover:text-eco-text rounded-lg hover:bg-eco-bg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-eco-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-xl shadow-card-hover border border-eco-border">
            <div className="flex items-center justify-between p-4 border-b border-eco-border">
              <h3 className="font-semibold text-eco-text text-sm">Bildirimler</h3>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-eco-gray" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-eco-border">
              {notifications.length === 0 ? (
                <p className="text-center text-eco-gray text-sm py-8">Bildirim yok</p>
              ) : notifications.map((n) => (
                <div key={n.id} className={`p-3 flex gap-3 items-start ${!n.is_read ? 'bg-eco-green-bg/40' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-eco-text truncate">{n.title}</p>
                    {n.body && <p className="text-xs text-eco-text-2 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-eco-gray mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="text-eco-green hover:text-eco-green-dk">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
