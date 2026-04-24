'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, MapPin, Award } from 'lucide-react';
import Badge, { statusBadge } from '@/components/ui/Badge';

export default function SahaMusteriDetay() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/agent/customers/${id}`).then((r) => r.json()).then(setCustomer);
  }, [id]);

  if (!customer) return <div className="p-10 text-center text-eco-gray">Yükleniyor...</div>;
  const { label, variant } = statusBadge(customer.status);

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/saha/musteriler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">{customer.name}</h1>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-eco-border p-5 space-y-3">
        <p className="flex items-center gap-2 text-sm text-eco-text-2"><Phone className="w-4 h-4 text-eco-gray" />{customer.phone}</p>
        {customer.region && <p className="flex items-center gap-2 text-sm text-eco-text-2"><MapPin className="w-4 h-4 text-eco-gray" />{customer.region}</p>}
      </div>
      <div className="bg-eco-green rounded-xl p-5 text-white">
        <p className="text-white/70 text-sm">Toplam Puan</p>
        <p className="text-3xl font-bold mt-1">{customer.total_points?.toLocaleString('tr-TR')}</p>
      </div>
      <Link href={`/saha/satis?customer_id=${id}`} className="eco-btn-primary w-full justify-center py-3">
        Bu Müşteriye Satış Yap
      </Link>
    </div>
  );
}
