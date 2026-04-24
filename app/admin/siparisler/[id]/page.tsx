'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Truck, Package } from 'lucide-react';

const ORDER_STATUSES = ['NEW', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function SiparisDetay() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d);
        setTracking(d.tracking_code ?? '');
        setCompany(d.shipment_company ?? '');
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tracking_code: tracking, shipment_company: company }),
    });
    setOrder((p: any) => ({ ...p, status }));
    setUpdating(false);
  }

  if (loading) return <div className="p-10 text-center text-eco-gray">Yükleniyor...</div>;
  if (!order) return <div className="p-10 text-center text-eco-error">Sipariş bulunamadı</div>;

  const { label, variant } = statusBadge(order.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/siparisler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">{order.order_number}</h1>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card border border-eco-border">
          <p className="text-xs text-eco-gray mb-1">Müşteri</p>
          <p className="font-semibold text-eco-text">{order.customer?.name}</p>
          <p className="text-sm text-eco-text-2">{order.customer?.phone}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card border border-eco-border">
          <p className="text-xs text-eco-gray mb-1">Mühendis</p>
          <p className="font-semibold text-eco-text">{order.engineer?.name ?? '—'}</p>
          <p className="text-xs text-eco-gray mt-1">{order.is_field_sale ? 'Saha Satışı' : 'Normal Sipariş'}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card border border-eco-border">
          <p className="text-xs text-eco-gray mb-1">Tutar / Puan</p>
          <p className="font-bold text-eco-text text-lg">{formatCurrency(order.total_amount)}</p>
          <p className="text-sm text-eco-green font-semibold">+{order.total_points} puan</p>
        </div>
      </div>

      {/* Durum Güncelleme */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-eco-border">
        <h2 className="font-semibold text-eco-text mb-4 flex items-center gap-2"><Truck className="w-4 h-4" />Kargo & Durum</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {ORDER_STATUSES.map((s) => {
            const { label: sl } = statusBadge(s);
            return (
              <button key={s} onClick={() => updateStatus(s)} disabled={updating || order.status === s}
                className={`eco-btn text-xs px-3 py-1.5 ${order.status === s ? 'bg-eco-green text-white' : 'bg-white border border-eco-border text-eco-text-2 hover:border-eco-green hover:text-eco-green'}`}>
                {sl}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Kargo Takip Kodu</label>
            <input className="eco-input" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Takip kodu..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-eco-text mb-1">Kargo Firması</label>
            <input className="eco-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ör: Yurtiçi, Aras" />
          </div>
        </div>
        <button onClick={() => updateStatus(order.status)} disabled={updating} className="eco-btn-primary mt-3 py-2 px-4 text-xs">
          Kargo Bilgisini Kaydet
        </button>
      </div>

      {/* Sipariş Kalemleri */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-eco-border">
        <h2 className="font-semibold text-eco-text mb-4 flex items-center gap-2"><Package className="w-4 h-4" />Sipariş Kalemleri</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-eco-gray">
            <tr className="border-b border-eco-border">
              <th className="text-left py-2">Ürün</th>
              <th className="text-right py-2">Miktar</th>
              <th className="text-right py-2">Birim Fiyat</th>
              <th className="text-right py-2">Tutar</th>
              <th className="text-right py-2">Puan</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.id} className="border-b border-eco-border/50">
                <td className="py-2">{item.product?.name}</td>
                <td className="text-right py-2">{item.quantity} {item.product?.unit}</td>
                <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                <td className="text-right py-2 font-semibold">{formatCurrency(item.quantity * item.unit_price)}</td>
                <td className="text-right py-2 text-eco-green">+{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
