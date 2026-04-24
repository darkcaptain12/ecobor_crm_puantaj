'use client';

import { useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { UserPlus, AlertCircle, Check, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { User } from '@/types/database';

const roleBadge: Record<string, any> = {
  ADMIN: { label: 'Admin', variant: 'purple' },
  ENGINEER: { label: 'Mühendis', variant: 'green' },
  REMOTE_AGENT: { label: 'Saha Temsilcisi', variant: 'blue' },
  CUSTOMER: { label: 'Müşteri', variant: 'gray' },
};

export default function KullanicilarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'ENGINEER', region: '' });

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((d) => { setUsers(d); setLoading(false); });
  }, []);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Hata'); return; }
    setUsers((p) => [data, ...p]);
    setShowModal(false);
    setForm({ name: '', phone: '', password: '', role: 'ENGINEER', region: '' });
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    setUsers((p) => p.map((u) => u.id === id ? { ...u, is_active: !current } : u));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-eco-text">Kullanıcı Yönetimi</h1>
        <button onClick={() => setShowModal(true)} className="eco-btn-primary">
          <UserPlus className="w-4 h-4" /> Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Ad Soyad', 'Telefon', 'Rol', 'Bölge', 'Durum', 'Kayıt', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-eco-gray">Yükleniyor...</td></tr>
              ) : users.map((u) => {
                const rb = roleBadge[u.role] ?? { label: u.role, variant: 'gray' };
                return (
                  <tr key={u.id} className="hover:bg-eco-bg/50">
                    <td className="px-4 py-3 font-medium text-eco-text">{u.name}</td>
                    <td className="px-4 py-3 text-eco-text-2">{u.phone}</td>
                    <td className="px-4 py-3"><Badge variant={rb.variant}>{rb.label}</Badge></td>
                    <td className="px-4 py-3 text-eco-text-2">{u.region ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`eco-badge ${u.is_active ? 'bg-eco-green-bg text-eco-green' : 'bg-red-50 text-eco-error'}`}>
                        {u.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-eco-gray text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className={`eco-btn text-xs px-3 py-1 ${u.is_active ? 'bg-red-50 text-eco-error hover:bg-eco-error hover:text-white' : 'bg-eco-green-bg text-eco-green hover:bg-eco-green hover:text-white'}`}
                      >
                        {u.is_active ? <><X className="w-3 h-3" />Pasife Al</> : <><Check className="w-3 h-3" />Aktive Et</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Kullanıcı Ekle">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-eco-error rounded-lg p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Ad Soyad *</label>
              <input className="eco-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Telefon *</label>
              <input className="eco-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Şifre *</label>
              <input type="password" className="eco-input" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Rol *</label>
              <select className="eco-select" value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="ENGINEER">Mühendis</option>
                <option value="REMOTE_AGENT">Saha Temsilcisi</option>
                <option value="CUSTOMER">Müşteri</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-eco-text mb-1">Bölge</label>
              <input className="eco-input" value={form.region} onChange={(e) => set('region', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="eco-btn-primary py-2 px-5">Kaydet</button>
            <button type="button" onClick={() => setShowModal(false)} className="eco-btn-secondary py-2 px-5">İptal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
