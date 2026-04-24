'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface PrescriptionFormProps {
  customerId: string;
  products: Product[];
  onSuccess?: () => void;
}

export function PrescriptionForm({ customerId, products, onSuccess }: PrescriptionFormProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [usageDays, setUsageDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1, usage_instruction: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1, usage_instruction: '' }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/engineer/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, diagnosis, usage_days: usageDays, notes, items }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onSuccess?.();
      setDiagnosis(''); setUsageDays(7); setNotes('');
      setItems([{ product_id: '', quantity: 1, usage_instruction: '' }]);
    } catch {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Teşhis / Problem" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
      <Input label="Kullanım Süresi (Gün)" type="number" value={usageDays}
        onChange={e => setUsageDays(parseInt(e.target.value))} min={1} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-eco-text-2">Ürünler</p>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <select
                className="w-full rounded-lg border border-eco-border bg-white px-3 py-2 text-sm text-eco-text"
                value={item.product_id}
                onChange={e => updateItem(i, 'product_id', e.target.value)}
                required
              >
                <option value="">Ürün seç...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
            </div>
            <Input type="number" placeholder="Miktar" value={item.quantity}
              onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value))}
              className="w-24" min={0.1} step={0.1} required />
            <Input placeholder="Kullanım talimatı" value={item.usage_instruction}
              onChange={e => updateItem(i, 'usage_instruction', e.target.value)} className="flex-1" />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)}
                className="text-eco-error hover:opacity-75 pb-2">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem}
          className="flex items-center gap-1 text-sm text-eco-green hover:underline">
          <Plus className="h-4 w-4" /> Ürün Ekle
        </button>
      </div>

      <Input label="Notlar" value={notes} onChange={e => setNotes(e.target.value)} />
      {error && <p className="text-sm text-eco-error">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Reçete Oluştur</Button>
    </form>
  );
}
