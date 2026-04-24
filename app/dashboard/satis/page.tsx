'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Plus, Trash2, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Suspense } from 'react';

function SatisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomer = searchParams.get('customer_id') ?? '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState(preselectedCustomer);
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/engineer/customers').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ]).then(([c, p]) => { setCustomers(c); setProducts(p); });
  }, []);

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const totalPoints = items.reduce((s, item) => {
    const prod = products.find((p: any) => p.id === item.product_id);
    return s + (prod?.point_value ?? 0) * item.quantity;
  }, 0);

  function addItem() { setItems((p) => [...p, { product_id: '', quantity: 1, unit_price: 0 }]); }
  function removeItem(idx: number) { setItems((p) => p.filter((_, i) => i !== idx)); }
  function updateItem(idx: number, field: string, value: any) {
    setItems((p) => {
      const items = [...p];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'product_id') {
        const prod = products.find((pr: any) => pr.id === value);
        if (prod) items[idx].unit_price = prod.price;
      }
      return items;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/engineer/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, is_field_sale: true, notes, items }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Hata'); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (success) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="w-16 h-16 bg-eco-green rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-eco-text">Satış Kaydedildi!</h2>
      <p className="text-eco-text-2 mt-2">+{totalPoints} puan müşteriye eklendi.</p>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Saha Satışı</h1>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-eco-error rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-eco-text mb-1">Müşteri *</label>
          <select className="eco-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            <option value="">Müşteri seç...</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-eco-text">Ürünler</label>
            <button type="button" onClick={addItem} className="text-xs text-eco-green flex items-center gap-1">
              <Plus className="w-3 h-3" />Ürün Ekle
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select className="eco-select flex-1" value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)}>
                  <option value="">Ürün...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.point_value} puan/{p.unit})</option>)}
                </select>
                <input type="number" min="0.1" step="0.1" className="eco-input w-20" placeholder="Miktar" value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                <input type="number" min="0" className="eco-input w-28" placeholder="Fiyat ₺" value={item.unit_price}
                  onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))} />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-eco-error hover:text-eco-error/80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-eco-text mb-1">Notlar</label>
          <textarea className="eco-input h-16 resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="bg-eco-green-bg rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-eco-text-2">Toplam Tutar</p>
            <p className="text-lg font-bold text-eco-green">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-eco-text-2">Kazanılacak Puan</p>
            <p className="text-lg font-bold text-eco-green">+{totalPoints}</p>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !customerId}
          className="w-full eco-btn-primary py-3 text-base font-semibold disabled:opacity-60">
          {loading ? 'Kaydediliyor...' : 'Satışı Kaydet'}
        </button>
      </div>
    </div>
  );
}

export default function SatisPage() {
  return <Suspense><SatisForm /></Suspense>;
}
