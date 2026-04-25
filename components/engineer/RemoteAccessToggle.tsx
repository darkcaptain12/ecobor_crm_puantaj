'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';

export default function RemoteAccessToggle() {
  const [enabled, setEnabled] = useState(false);
  const [expireAt, setExpireAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/engineer/remote-access')
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.is_remote_enabled ?? false);
        setExpireAt(d.remote_expire_at ?? null);
        setLoading(false);
      });
  }, []);

  async function toggle() {
    setSaving(true);
    const res = await fetch('/api/engineer/remote-access', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_remote_enabled: !enabled }),
    });
    const data = await res.json();
    setEnabled(data.is_remote_enabled ?? false);
    setExpireAt(data.remote_expire_at ?? null);
    setSaving(false);
  }

  const expired = expireAt && new Date(expireAt) < new Date();
  const isActive = enabled && !expired;

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl border border-eco-border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? 'bg-eco-green/10' : 'bg-gray-100'}`}>
          {isActive ? <ShieldCheck className="w-4 h-4 text-eco-green" /> : <ShieldOff className="w-4 h-4 text-eco-gray" />}
        </div>
        <div>
          <p className="font-medium text-eco-text text-sm">Dış Erişim</p>
          <p className="text-xs text-eco-gray">
            {isActive
              ? `Aktif · ${expireAt ? new Date(expireAt).toLocaleDateString('tr-TR') + ' tarihine kadar' : ''}`
              : expired ? 'Süresi doldu' : 'Kapalı — sadece şirket ağından erişebilirsiniz'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isActive ? 'bg-eco-green' : 'bg-gray-200'
        } ${saving ? 'opacity-50' : ''}`}
        aria-label="Dış erişimi aç/kapat"
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
