'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, MapPin } from 'lucide-react';

export default function YeniMusteriler() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', region: '', crop_type: '', planting_date: '', notes: '', location_lat: '', location_lng: '' });

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      set('location_lat', String(pos.coords.latitude));
      set('location_lng', String(pos.coords.longitude));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/engineer/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Hata'); setLoading(false); return; }
    router.push('/dashboard/musteriler');
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/musteriler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">Yeni Müşteri</h1>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-eco-error rounded-lg p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-eco-text mb-1">Ad Soyad *</label>
              <input className="eco-input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-eco-text mb-1">Telefon *</label>
              <input className="eco-input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-eco-text mb-1">Bölge</label>
              <input className="eco-input" value={form.region} onChange={(e) => set('region', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-eco-text mb-1">Ekin Türü</label>
              <input className="eco-input" value={form.crop_type} onChange={(e) => set('crop_type', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-eco-text mb-1">Ekim Tarihi</label>
              <input type="date" className="eco-input" value={form.planting_date} onChange={(e) => set('planting_date', e.target.value)} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-eco-text">GPS Konumu</label>
              <button type="button" onClick={getLocation} className="text-xs text-eco-green flex items-center gap-1">
                <MapPin className="w-3 h-3" />Konumumu Al
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="eco-input" placeholder="Enlem" value={form.location_lat} onChange={(e) => set('location_lat', e.target.value)} />
              <input className="eco-input" placeholder="Boylam" value={form.location_lng} onChange={(e) => set('location_lng', e.target.value)} />
            </div>
          </div>
          <div><label className="block text-sm font-medium text-eco-text mb-1">Notlar</label>
            <textarea className="eco-input h-20 resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="eco-btn-primary py-2.5 px-6 disabled:opacity-60">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <Link href="/dashboard/musteriler" className="eco-btn-secondary py-2.5 px-6">İptal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
