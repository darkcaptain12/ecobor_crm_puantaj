import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple';

const variants: Record<BadgeVariant, string> = {
  green: 'bg-eco-green-bg text-eco-green',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-eco-error',
  blue: 'bg-blue-50 text-eco-info',
  gray: 'bg-gray-100 text-eco-gray',
  purple: 'bg-purple-50 text-purple-700',
};

export default function Badge({ variant = 'gray', className, children }: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn('eco-badge', variants[variant], className)}>
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    new: { label: 'Yeni', variant: 'blue' },
    active: { label: 'Aktif', variant: 'green' },
    dealer: { label: 'Bayi', variant: 'purple' },
    NEW: { label: 'Yeni', variant: 'blue' },
    PREPARING: { label: 'Hazırlanıyor', variant: 'yellow' },
    SHIPPED: { label: 'Kargoda', variant: 'purple' },
    DELIVERED: { label: 'Teslim Edildi', variant: 'green' },
    CANCELLED: { label: 'İptal', variant: 'red' },
    pending: { label: 'Bekliyor', variant: 'yellow' },
    in_progress: { label: 'Devam Ediyor', variant: 'blue' },
    done: { label: 'Tamamlandı', variant: 'green' },
    approved: { label: 'Onaylandı', variant: 'green' },
    rejected: { label: 'Reddedildi', variant: 'red' },
  };
  return map[status] ?? { label: status, variant: 'gray' as BadgeVariant };
}
