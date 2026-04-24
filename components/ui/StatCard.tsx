import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'yellow' | 'purple';
  change?: string;
}

const colors = {
  green: { bg: 'bg-eco-green-bg', text: 'text-eco-green', border: 'border-l-eco-green' },
  blue: { bg: 'bg-blue-50', text: 'text-eco-info', border: 'border-l-eco-info' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-l-yellow-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-400' },
};

export default function StatCard({ title, value, icon: Icon, color = 'green', change }: StatCardProps) {
  const c = colors[color];
  return (
    <div className={cn('stat-card border-l-4', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-eco-gray uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-eco-text mt-1">{value}</p>
          {change && <p className="text-xs text-eco-text-2 mt-1">{change}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg', c.bg)}>
          <Icon className={cn('w-5 h-5', c.text)} />
        </div>
      </div>
    </div>
  );
}
