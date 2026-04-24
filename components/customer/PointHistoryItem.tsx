import { TrendingUp, TrendingDown } from 'lucide-react';

interface PointHistoryItemProps {
  type: string;
  points: number;
  description: string | null;
  createdAt: string;
}

export function PointHistoryItem({ type, points, description, createdAt }: PointHistoryItemProps) {
  const isEarn = type === 'earn';
  return (
    <div className="flex items-center justify-between py-3 border-b border-eco-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isEarn ? 'bg-eco-green-bg' : 'bg-red-50'}`}>
          {isEarn
            ? <TrendingUp className="h-4 w-4 text-eco-green" />
            : <TrendingDown className="h-4 w-4 text-eco-error" />}
        </div>
        <div>
          <p className="text-sm font-medium text-eco-text">{description ?? (isEarn ? 'Puan kazanıldı' : 'Puan harcandı')}</p>
          <p className="text-xs text-eco-gray">
            {new Date(createdAt).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isEarn ? 'text-eco-green' : 'text-eco-error'}`}>
        {isEarn ? '+' : '-'}{Math.abs(points).toLocaleString('tr-TR')}
      </span>
    </div>
  );
}
