'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomerFormProps {
  initial?: Partial<Customer>;
  users?: { id: string; name: string }[];
  onSuccess?: (data: any) => void;
  editId?: string;
}

interface Customer {
  name: string; phone: string; region: string; crop_type: string;
  planting_date: string; status: string; assigned_to: string; notes: string;
}

export function CustomerForm({ initial = {}, users = [], onSuccess, editId }: CustomerFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    phone: initial.phone ?? '',
    region: initial.region ?? '',
    crop_type: initial.crop_type ?? '',
    planting_date: initial.planting_date ?? '',
    status: initial.status ?? 'new',
    assigned_to: initial.assigned_to ?? '',
    notes: initial.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const url = editId ? `/api/admin/customers/${editId}` : '/api/admin/customers';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onSuccess?.(data);
    } catch { setError('Bir hata oluştu'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ad Soyad" value={form.name} onChange={set('name')} required />
        <Input label="Telefon" value={form.phone} onChange={set('phone')} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Bölge" value={form.region} onChange={set('region')} />
        <Input label="Ekin Türü" value={form.crop_type} onChange={set('crop_type')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ekim Tarihi" type="date" value={form.planting_date} onChange={set('planting_date')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-eco-text-2">Durum</label>
          <select className="rounded-lg border border-eco-border bg-white px-3 py-2 text-sm text-eco-text focus:border-eco-green focus:outline-none"
            value={form.status} onChange={set('status')}>
            <option value="new">Yeni</option>
            <option value="active">Aktif</option>
            <option value="dealer">Bayi</option>
          </select>
        </div>
      </div>
      {users.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-eco-text-2">Atanan Mühendis/Temsilci</label>
          <select className="rounded-lg border border-eco-border bg-white px-3 py-2 text-sm text-eco-text focus:border-eco-green focus:outline-none"
            value={form.assigned_to} onChange={set('assigned_to')}>
            <option value="">Atanmamış</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-eco-text-2">Notlar</label>
        <textarea className="w-full rounded-lg border border-eco-border bg-white px-3 py-2 text-sm text-eco-text focus:border-eco-green focus:outline-none resize-none"
          rows={3} value={form.notes} onChange={set('notes')} />
      </div>
      {error && <p className="text-sm text-eco-error">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        {editId ? 'Güncelle' : 'Müşteri Ekle'}
      </Button>
    </form>
  );
}
