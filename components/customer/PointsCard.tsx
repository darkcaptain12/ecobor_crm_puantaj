import { Star } from 'lucide-react';

interface PointsCardProps {
  name: string;
  totalPoints: number;
}

export function PointsCard({ name, totalPoints }: PointsCardProps) {
  return (
    <div className="rounded-2xl bg-eco-green p-6 text-white shadow-lg">
      <p className="text-sm font-medium opacity-80">{name}</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-5xl font-bold tracking-tight">
          {totalPoints.toLocaleString('tr-TR')}
        </span>
        <div className="mb-1 flex items-center gap-1 text-lg font-semibold opacity-90">
          <Star className="h-5 w-5 fill-white" />
          Puan
        </div>
      </div>
      <p className="mt-2 text-xs opacity-70">Toplam kazanılan puan</p>
    </div>
  );
}
