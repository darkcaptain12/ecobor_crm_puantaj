'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/lib/utils';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { ArrowLeft, Plus, Phone, MapPin, Wheat, Award, Truck, Package, CheckCircle2 } from 'lucide-react';

const SHIPMENT_STATUS: Record<string, { label: string; color: string; step: number }> = {
  preparing: { label: 'Hazırlanıyor', color: 'text-yellow-600', step: 1 },
  shipped: { label: 'Kargoya Verildi', color: 'text-blue-600', step: 2 },
  in_transit: { label: 'Yolda', color: 'text-purple-600', step: 3 },
  delivered: { label: 'Teslim Edildi', color: 'text-eco-green', step: 4 },
};

export default function EngineerMusteriDetay() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<Record<string, any>>({});
  const [showInterModal, setShowInterModal] = useState(false);
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [interForm, setInterForm] = useState({ type: 'call', note: '', next_followup: '' });
  const [prescForm, setPrescForm] = useState({ diagnosis: '', usage_days: 7, notes: '', items: [{ product_id: '', quantity: 1 }] });

  useEffect(() => {
    Promise.all([
      fetch(`/api/engineer/customers/${id}`).then((r) => r.json()),
      fetch(`/api/engineer/interactions/${id}`).then((r) => r.json()),
      fetch(`/api/engineer/prescriptions/${id}`).then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
      fetch(`/api/engineer/orders?customer_id=${id}`).then((r) => r.json()),
    ]).then(async ([c, i, p, prods, ords]) => {
      setCustomer(c);
      setInteractions(Array.isArray(i) ? i : []);
      setPrescriptions(Array.isArray(p) ? p : []);
      setProducts(Array.isArray(prods) ? prods : []);
      const orderList = Array.isArray(ords) ? ords : [];
      setOrders(orderList);
      if (orderList.length > 0) {
        const ids = orderList.map((o: any) => o.id).join(',');
        const sRes = await fetch(`/api/shipments?order_ids=${ids}`);
        const sData = await sRes.json();
        const map: Record<string, any> = {};
        (Array.isArray(sData) ? sData : []).forEach((s: any) => { map[s.order_id] = s; });
        setShipments(map);
      }
    });
  }, [id]);

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/engineer/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: id, ...interForm }),
    });
    const data = await res.json();
    setInteractions((p) => [data, ...p]);
    setShowInterModal(false);
    setInterForm({ type: 'call', note: '', next_followup: '' });
  }

  async function addPrescription(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/engineer/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: id, ...prescForm }),
    });
    const data = await res.json();
    setPrescriptions((p) => [data, ...p]);
    setShowPrescModal(false);
  }

  if (!customer) return <div className="p-10 text-center text-eco-gray">Yükleniyor...</div>;

  const { label, variant } = statusBadge(customer.status);
  const typeColors: any = { call: 'bg-eco-green', visit: 'bg-eco-info', note: 'bg-eco-warning' };
  const typeLabels: any = { call: 'Arama', visit: 'Ziyaret', note: 'Not' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/musteriler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">{customer.name}</h1>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bilgiler */}
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5 space-y-3 text-sm">
          <h2 className="font-semibold text-eco-text mb-2">Bilgiler</h2>
          <p className="flex items-center gap-2 text-eco-text-2"><Phone className="w-4 h-4 text-eco-gray" />{customer.phone}</p>
          {customer.region && <p className="flex items-center gap-2 text-eco-text-2"><MapPin className="w-4 h-4 text-eco-gray" />{customer.region}</p>}
          {customer.crop_type && <p className="flex items-center gap-2 text-eco-text-2"><Wheat className="w-4 h-4 text-eco-gray" />{customer.crop_type}</p>}
        </div>
        <div className="bg-eco-green rounded-xl p-5 text-white">
          <p className="text-white/70 text-sm">Toplam Puan</p>
          <p className="text-4xl font-bold mt-1">{customer.total_points?.toLocaleString('tr-TR')}</p>
          <p className="text-white/70 text-xs mt-3">Kayıt: {formatDate(customer.created_at)}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => setShowInterModal(true)} className="eco-btn-primary py-3 justify-center">
            <Plus className="w-4 h-4" />Etkileşim Ekle
          </button>
          <button onClick={() => setShowPrescModal(true)} className="eco-btn-secondary py-3 justify-center">
            <Plus className="w-4 h-4" />Reçete Yaz
          </button>
          <Link href={`/dashboard/satis?customer_id=${id}`} className="eco-btn py-3 justify-center bg-purple-50 text-purple-700 hover:bg-purple-700 hover:text-white">
            <Award className="w-4 h-4" />Satış Yap
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
        <h2 className="font-semibold text-eco-text mb-4">Etkileşim Geçmişi</h2>
        <div className="relative pl-6 space-y-4">
          {interactions.map((i, idx) => (
            <div key={i.id} className="relative">
              {idx < interactions.length - 1 && (
                <div className="absolute left-[-19px] top-5 bottom-[-16px] w-0.5 bg-eco-border" />
              )}
              <div className={`absolute left-[-23px] top-1 w-3 h-3 rounded-full ${typeColors[i.type] ?? 'bg-eco-gray'}`} />
              <div className="bg-eco-bg rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-eco-text">{typeLabels[i.type]}</span>
                  <span className="text-xs text-eco-gray">{formatDateTime(i.date)}</span>
                  {i.next_followup && (
                    <span className="ml-auto text-xs text-eco-warning">Takip: {formatDateTime(i.next_followup)}</span>
                  )}
                </div>
                {i.note && <p className="text-sm text-eco-text-2 mt-1">{i.note}</p>}
              </div>
            </div>
          ))}
          {!interactions.length && <p className="text-sm text-eco-gray">Henüz etkileşim yok</p>}
        </div>
      </div>

      {/* Reçeteler */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
        <h2 className="font-semibold text-eco-text mb-4">Reçeteler</h2>
        <div className="space-y-3">
          {prescriptions.map((p: any) => (
            <div key={p.id} className="border border-eco-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{formatDate(p.date)}</span>
                <span className="text-xs text-eco-gray">{p.usage_days} gün kullanım</span>
              </div>
              {p.diagnosis && <p className="text-xs text-eco-text-2 mb-2">{p.diagnosis}</p>}
              {p.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs text-eco-text-2">
                  <span>{item.product?.name}</span>
                  <span>{item.quantity} {item.unit ?? item.product?.unit}</span>
                  {item.expiry_date && <span className="text-eco-warning">Bitiş: {formatDate(item.expiry_date)}</span>}
                </div>
              ))}
            </div>
          ))}
          {!prescriptions.length && <p className="text-sm text-eco-gray">Reçete yok</p>}
        </div>
      </div>

      {/* Kargo / Siparişler */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-card border border-eco-border p-5">
          <h2 className="font-semibold text-eco-text mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-eco-green" /> Kargo & Sipariş Geçmişi
          </h2>
          <div className="space-y-3">
            {orders.map((order: any) => {
              const shipment = shipments[order.id];
              const cfg = shipment ? SHIPMENT_STATUS[shipment.status] ?? SHIPMENT_STATUS.preparing : null;
              const { label: orderLabel } = statusBadge(order.status);
              return (
                <div key={order.id} className="border border-eco-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-eco-gray">{order.order_number}</p>
                      <p className="font-semibold text-eco-text text-sm">
                        {Number(order.total_amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                    {cfg ? (
                      <span className={`text-xs font-semibold flex items-center gap-1 ${cfg.color}`}>
                        <Truck className="w-3.5 h-3.5" />{cfg.label}
                      </span>
                    ) : (
                      <span className="text-xs text-eco-gray">{orderLabel}</span>
                    )}
                  </div>
                  {shipment && (
                    <>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className={`h-1 flex-1 rounded-full ${step <= (cfg?.step ?? 0) ? 'bg-eco-green' : 'bg-eco-border'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-eco-gray">
                        <Truck className="w-3 h-3 inline mr-1" />
                        {shipment.carrier} · <span className="font-mono">{shipment.tracking_number}</span>
                        {shipment.status === 'delivered' && <CheckCircle2 className="w-3 h-3 inline ml-2 text-eco-green" />}
                      </p>
                    </>
                  )}
                  {!shipment && order.tracking_code && (
                    <p className="text-xs text-eco-gray mt-1">
                      <Package className="w-3 h-3 inline mr-1" />
                      {order.shipment_company} · {order.tracking_code}
                    </p>
                  )}
                  <p className="text-xs text-eco-gray mt-1">{formatDate(order.created_at)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Etkileşim Modal */}
      <Modal open={showInterModal} onClose={() => setShowInterModal(false)} title="Etkileşim Ekle">
        <form onSubmit={addInteraction} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Tür</label>
            <select className="eco-select" value={interForm.type} onChange={(e) => setInterForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="call">Arama</option>
              <option value="visit">Ziyaret</option>
              <option value="note">Not</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Not</label>
            <textarea className="eco-input h-24 resize-none" value={interForm.note} onChange={(e) => setInterForm((p) => ({ ...p, note: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Sonraki Takip</label>
            <input type="datetime-local" className="eco-input" value={interForm.next_followup} onChange={(e) => setInterForm((p) => ({ ...p, next_followup: e.target.value }))} />
          </div>
          <div className="flex gap-3"><button type="submit" className="eco-btn-primary py-2 px-5">Kaydet</button></div>
        </form>
      </Modal>

      {/* Reçete Modal */}
      <Modal open={showPrescModal} onClose={() => setShowPrescModal(false)} title="Reçete Yaz" size="lg">
        <form onSubmit={addPrescription} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-eco-text mb-1">Tanı / Teşhis</label>
              <input className="eco-input" value={prescForm.diagnosis} onChange={(e) => setPrescForm((p) => ({ ...p, diagnosis: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-eco-text mb-1">Kullanım Süresi (gün)</label>
              <input type="number" min="1" className="eco-input" value={prescForm.usage_days} onChange={(e) => setPrescForm((p) => ({ ...p, usage_days: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-eco-text mb-2">Ürünler</label>
            {prescForm.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="eco-select flex-1" value={item.product_id} onChange={(e) => {
                  const items = [...prescForm.items];
                  items[idx] = { ...items[idx], product_id: e.target.value };
                  setPrescForm((p) => ({ ...p, items }));
                }}>
                  <option value="">Ürün seç...</option>
                  {products.map((pr: any) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                </select>
                <input type="number" min="0.1" step="0.1" className="eco-input w-20" value={item.quantity} onChange={(e) => {
                  const items = [...prescForm.items];
                  items[idx] = { ...items[idx], quantity: Number(e.target.value) };
                  setPrescForm((p) => ({ ...p, items }));
                }} />
              </div>
            ))}
            <button type="button" onClick={() => setPrescForm((p) => ({ ...p, items: [...p.items, { product_id: '', quantity: 1 }] }))}
              className="text-xs text-eco-green hover:underline">+ Ürün Ekle</button>
          </div>
          <div className="flex gap-3"><button type="submit" className="eco-btn-primary py-2 px-5">Kaydet</button></div>
        </form>
      </Modal>
    </div>
  );
}
