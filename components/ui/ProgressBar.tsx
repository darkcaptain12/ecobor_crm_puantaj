interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export default function ProgressBar({ value, max, label, showPercent, color = 'bg-eco-green' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-eco-text-2 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2.5 bg-eco-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
