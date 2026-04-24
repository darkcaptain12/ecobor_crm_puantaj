import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { MapPin, Phone, Sprout } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    region?: string | null;
    crop_type?: string | null;
    status: string;
    total_points: number;
  };
  href: string;
}

const statusMap: Record<string, 'green' | 'yellow' | 'blue'> = {
  active: 'green',
  new: 'yellow',
  dealer: 'blue',
};

const statusLabel: Record<string, string> = {
  active: 'Aktif',
  new: 'Yeni',
  dealer: 'Bayi',
};

export function CustomerCard({ customer, href }: CustomerCardProps) {
  return (
    <Link href={href}
      className="block rounded-xl border border-eco-border bg-white p-4 shadow-sm hover:border-eco-green hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-eco-text">{customer.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-eco-gray">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>
            {customer.region && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.region}</span>}
            {customer.crop_type && <span className="flex items-center gap-1"><Sprout className="h-3 w-3" />{customer.crop_type}</span>}
          </div>
        </div>
        <Badge variant={statusMap[customer.status] ?? 'gray'}>{statusLabel[customer.status] ?? customer.status}</Badge>
      </div>
      <div className="mt-2 text-xs text-eco-text-2 font-medium">{customer.total_points} Puan</div>
    </Link>
  );
}
