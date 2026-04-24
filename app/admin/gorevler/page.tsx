'use client';

import { useState, useEffect } from 'react';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { Plus, CheckSquare } from 'lucide-react';

export default function GorevlerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'visit', assigned_to: '', customer_id: '', due_date: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/tasks').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/customers').then((r) => r.json()),
    ]).then(([t, u, c]) => { setTasks(t); setUsers(u); setCustomers(c); });
  }, []);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setTasks((p) => [data, ...p]);
    setShowModal(false);
    setForm({ title: '', description: '', type: 'visit', assigned_to: '', customer_id: '', due_date: '' });
  }

  async function completeTask(id: string) {
    await fetch(`/api/admin/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    setTasks((p) => p.map((t) => t.id === id ? { ...t, status: 'done' } : t));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-eco-text">Görev Yönetimi</h1>
        <button onClick={() => setShowModal(true)} className="eco-btn-primary"><Plus className="w-4 h-4" />Yeni Görev</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['pending', 'in_progress', 'done'].map((s) => {
          const filtered = tasks.filter((t) => t.status === s);
          const { label: sl, variant: sv } = statusBadge(s);
          return (
            <div key={s} className="bg-white rounded-xl shadow-card border border-eco-border p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={sv}>{sl}</Badge>
                <span className="text-xs text-eco-gray">{filtered.length} görev</span>
              </div>
              <div className="space-y-2">
                {filtered.map((t: any) => (
                  <div key={t.id} className="border border-eco-border rounded-lg p-3">
                    <p className="text-sm font-medium text-eco-text">{t.title}</p>
                    <p className="text-xs text-eco-text-2 mt-0.5">{t.assignee?.name}</p>
                    {t.due_date && <p className="text-xs text-eco-warning mt-0.5">Bitiş: {formatDate(t.due_date)}</p>}
                    {s !== 'done' && (
                      <button onClick={() => completeTask(t.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-eco-green hover:underline">
                        <CheckSquare className="w-3 h-3" />Tamamla
                      </button>
                    )}
                  </div>
                ))}
                {!filtered.length && <p className="text-xs text-eco-gray text-center py-4">Görev yok</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Görev Ata">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Başlık *</label>
            <input className="eco-input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Açıklama</label>
            <textarea className="eco-input h-20 resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Tip</label>
              <select className="eco-select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="visit">Saha Ziyareti</option>
                <option value="call">Arama</option>
                <option value="delivery">Teslimat</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Kişi *</label>
              <select className="eco-select" value={form.assigned_to} onChange={(e) => set('assigned_to', e.target.value)} required>
                <option value="">Seç...</option>
                {users.filter((u) => ['ENGINEER', 'REMOTE_AGENT'].includes(u.role)).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Müşteri</label>
              <select className="eco-select" value={form.customer_id} onChange={(e) => set('customer_id', e.target.value)}>
                <option value="">Seç...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Bitiş Tarihi</label>
              <input type="date" className="eco-input" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
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
