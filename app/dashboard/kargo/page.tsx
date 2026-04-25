'use client';

import { useState, useEffect, useCallback } from 'react';
import { Truck, Package, CheckCircle2, Clock, RefreshCw, Plus, X } from 'lucide-react';

type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered';

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  preparing: { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped: { label: 'Kargoya Verildi', color: 'bg-blue-100 text-blue-700', icon: Truck },
  in_transit: { label: 'Yolda', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

const CARRIERS = ['Yurtiçi', 'Aras', 'MNG', 'PTT Kargo', 'Sürat', 'UPS'];

export default function KargoPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', tracking_number: '', carrier: 'Yurtiçi' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [shipRes, ordRes] = await Promise.all([
      fetch('/api/shipments'),
      fetch('/api/engineer/orders?status=NEW,PREPARING,SHIPPED'),
    ]);
    const [shipData, ordData] = await Promise.all([shipRes.json(), ordRes.json()]);
    setShipments(Array.isArray(shipData) ? shipData : []);
    setOrders(Array.isArray(ordData) ? ordData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function simulate() {
    setSimulating(true);
    const res = await fetch('/api/shipments/simulate', { method: 'POST' });
    const data = await res.json();
    setMessage(data.message ?? 'Güncellendi');
    await load();
    setSimulating(false);
    setTimeout(() => setMessage(''), 3000);
  }

  async function createShipment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ order_id: '', tracking_number: '', carrier: 'Yurtiçi' });
      await load();
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: ShipmentStatus) {
    await fetch(`/api/shipments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  const nextStatus = (current: ShipmentStatus): ShipmentStatus | null => {
    const flow: ShipmentStatus[] = ['preparing', 'shipped', 'in_transit', 'delivered'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-eco-text">Kargo Takibi</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {message && (
            <span className="text-xs text-eco-green bg-eco-green/10 px-3 py-1 rounded-full">{message}</span>
          )}
          <button
            onClick={simulate}
            disabled={simulating}
            className="eco-btn-secondary text-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Güncelleniyor...' : 'Demo Simüle Et'}
          </button>
          <button onClick={() => setShowForm(true)} className="eco-btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Kargo Ekle
          </button>
        </div>
      </div>

      {/* Yeni Kargo Formu */}
      {showForm && (
        <div className="bg-white rounded-xl border border-eco-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-eco-text">Yeni Kargo Kaydı</h2>
            <button onClick={() => setShowForm(false)} className="text-eco-gray hover:text-eco-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={createShipment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-eco-gray mb-1">Sipariş</label>
              <select
                value={form.order_id}
                onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value }))}
                className="eco-select w-full"
                required
              >
                <option value="">Sipariş seçin...</option>
                {orders.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.customer?.name ?? 'Müşteri'} — {o.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-gray mb-1">Takip No</label>
              <input
                value={form.tracking_number}
                onChange={(e) => setForm((f) => ({ ...f, tracking_number: e.target.value }))}
                placeholder="TRK123456789"
                className="eco-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-gray mb-1">Kargo Şirketi</label>
              <select
                value={form.carrier}
                onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
                className="eco-select w-full"
              >
                {CARRIERS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button type="submit" disabled={saving} className="eco-btn-primary">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kargo Listesi */}
      {loading ? (
        <div className="text-center py-12 text-eco-gray">Yükleniyor...</div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 text-eco-gray">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Henüz kargo kaydı yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {shipments.map((s: any) => {
            const cfg = STATUS_CONFIG[s.status as ShipmentStatus] ?? STATUS_CONFIG.preparing;
            const Icon = cfg.icon;
            const next = nextStatus(s.status);
            return (
              <div key={s.id} className="bg-white rounded-xl border border-eco-border shadow-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-eco-text text-sm">
                      {s.order?.customer?.name ?? 'Müşteri'}
                    </p>
                    <p className="text-xs text-eco-gray mt-0.5 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {s.carrier} · {s.tracking_number}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                </div>

                {/* İlerleme çubuğu */}
                <div className="flex items-center gap-1 mb-3">
                  {['preparing', 'shipped', 'in_transit', 'delivered'].map((st, i) => {
                    const statuses = ['preparing', 'shipped', 'in_transit', 'delivered'];
                    const currentIdx = statuses.indexOf(s.status);
                    const active = i <= currentIdx;
                    return (
                      <div key={st} className={`h-1.5 flex-1 rounded-full ${active ? 'bg-eco-green' : 'bg-eco-border'}`} />
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-eco-gray">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(s.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {next && (
                    <button
                      onClick={() => updateStatus(s.id, next as ShipmentStatus)}
                      className="eco-btn-secondary text-xs py-1 px-3"
                    >
                      → {STATUS_CONFIG[next as ShipmentStatus].label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
