'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  ENGINEER: 'Mühendis',
  MANAGER: 'Müdür',
  REMOTE_AGENT: 'Saha Temsilcisi',
};

export default function UzakErisimPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/remote-access');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggle(userId: string, currentValue: boolean) {
    setSaving(userId);
    await fetch('/api/admin/remote-access', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        is_remote_enabled: !currentValue,
        remote_expire_at: !currentValue
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      }),
    });
    await load();
    setSaving(null);
  }

  const enabledCount = users.filter((u) => u.is_remote_enabled).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-eco-text">Uzak Erişim Yönetimi</h1>
          <p className="text-sm text-eco-gray mt-0.5">
            Dış IP&apos;den sisteme erişebilecek kullanıcıları yönetin
          </p>
        </div>
        <button onClick={load} className="eco-btn-secondary text-sm flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-eco-border p-4">
          <p className="text-xs text-eco-gray">Toplam Personel</p>
          <p className="text-2xl font-bold text-eco-text mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-eco-border p-4">
          <p className="text-xs text-eco-gray">Uzak Erişim Açık</p>
          <p className="text-2xl font-bold text-eco-green mt-1">{enabledCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-eco-border p-4">
          <p className="text-xs text-eco-gray">Erişim Kapalı</p>
          <p className="text-2xl font-bold text-eco-text mt-1">{users.length - enabledCount}</p>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-xl border border-eco-border overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-eco-gray">Yükleniyor...</div>
        ) : (
          <div className="divide-y divide-eco-border">
            {users.map((user) => {
              const expired = user.remote_expire_at && new Date(user.remote_expire_at) < new Date();
              const active = user.is_remote_enabled && !expired;

              return (
                <div key={user.id} className="flex items-center justify-between px-4 py-4 hover:bg-eco-bg/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-eco-green/10' : 'bg-gray-100'}`}>
                      {active
                        ? <ShieldCheck className="w-4 h-4 text-eco-green" />
                        : <ShieldOff className="w-4 h-4 text-eco-gray" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-eco-text text-sm">{user.name}</p>
                      <p className="text-xs text-eco-gray">
                        {ROLE_LABELS[user.role] ?? user.role}
                        {user.remote_expire_at && !expired && (
                          <span className="ml-2 text-eco-green">
                            · {new Date(user.remote_expire_at).toLocaleDateString('tr-TR')} tarihine kadar
                          </span>
                        )}
                        {expired && <span className="ml-2 text-red-500">· Süresi doldu</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(user.id, active)}
                    disabled={saving === user.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      active ? 'bg-eco-green' : 'bg-gray-200'
                    } ${saving === user.id ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <Shield className="w-4 h-4 inline mr-1" />
        Uzak erişim açıldığında <strong>7 gün</strong> otomatik süre atanır. Süre dolunca erişim otomatik kapanır.
      </div>
    </div>
  );
}
