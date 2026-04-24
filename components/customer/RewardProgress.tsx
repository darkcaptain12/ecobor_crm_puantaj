import ProgressBar from '@/components/ui/ProgressBar';
import { Gift } from 'lucide-react';

interface RewardProgressProps {
  totalPoints: number;
  nextReward: {
    name: string;
    points_required: number;
    reward_value: string;
  } | null;
}

export function RewardProgress({ totalPoints, nextReward }: RewardProgressProps) {
  if (!nextReward) {
    return (
      <div className="rounded-xl border border-eco-green bg-eco-green-bg p-4 text-center">
        <Gift className="mx-auto h-8 w-8 text-eco-green" />
        <p className="mt-2 font-semibold text-eco-green">Tüm ödülleri kazandınız!</p>
      </div>
    );
  }

  const progress = Math.min(100, (totalPoints / nextReward.points_required) * 100);
  const remaining = nextReward.points_required - totalPoints;

  return (
    <div className="rounded-xl border border-eco-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-eco-text">Bir Sonraki Hediyeniz</p>
        <span className="text-xs text-eco-gray">{remaining.toLocaleString('tr-TR')} puana kadar</span>
      </div>
      <ProgressBar value={totalPoints} max={nextReward.points_required} showPercent />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-eco-green-bg">
          <Gift className="h-5 w-5 text-eco-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-eco-text">{nextReward.name}</p>
          <p className="text-xs text-eco-gray">{nextReward.reward_value} — {nextReward.points_required.toLocaleString('tr-TR')} puan</p>
        </div>
      </div>
    </div>
  );
}
