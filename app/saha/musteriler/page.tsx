'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { Phone, MapPin } from 'lucide-react';

export default function SahaMusteriler() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/agent/customers').then((r) => r.json()).then((d) => setCustomers(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Müşterilerim</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customers.map((c: any) => {
          const { label, variant } = statusBadge(c.status);
          return (
            <Link key={c.id} href={`/saha/musteriler/${c.id}`}
              className="bg-white rounded-xl shadow-card border border-eco-border p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex justify-between mb-2">
                <p className="font-semibold text-eco-text">{c.name}</p>
                <Badge variant={variant}>{label}</Badge>
              </div>
              <p className="text-xs text-eco-text-2 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
              {c.region && <p className="text-xs text-eco-text-2 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{c.region}</p>}
            </Link>
          );
        })}
        {!customers.length && <p className="text-eco-gray col-span-2">Müşteri yok</p>}
      </div>
    </div>
  );
}
