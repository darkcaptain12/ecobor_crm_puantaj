'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function YeniMusteri() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', region: '', crop_type: '',
    planting_date: '', status: 'new', notes: '',
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Bir hata oluştu');
      setLoading(false);
      return;
    }

    router.push('/admin/musteriler');
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/musteriler" className="text-eco-gray hover:text-eco-text">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-eco-text">Yeni Müşteri</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border p-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-eco-error rounded-lg p-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Ad Soyad *</label>
              <input className="eco-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Telefon *</label>
              <input className="eco-input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="05XX XXX XX XX" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Bölge</label>
              <input className="eco-input" value={form.region} onChange={(e) => set('region', e.target.value)} placeholder="ör: Konya, Bursa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Ekin Türü</label>
              <input className="eco-input" value={form.crop_type} onChange={(e) => set('crop_type', e.target.value)} placeholder="ör: Buğday, Zeytin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Ekim Tarihi</label>
              <input className="eco-input" type="date" value={form.planting_date} onChange={(e) => set('planting_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Durum</label>
              <select className="eco-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="new">Yeni</option>
                <option value="active">Aktif</option>
                <option value="dealer">Bayi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-eco-text mb-1.5">Notlar</label>
            <textarea className="eco-input h-24 resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="eco-btn-primary py-2.5 px-6 disabled:opacity-60">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href="/admin/musteriler" className="eco-btn-secondary py-2.5 px-6">İptal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
