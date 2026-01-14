import { getRDSColor, getRDSBgColor, getRDSLabel } from '@/lib/rds';

interface RDSBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RDSBadge({ score, size = 'md', showLabel = false }: RDSBadgeProps) {
  const colorClass = getRDSColor(score);
  const bgClass = getRDSBgColor(score);
  const label = getRDSLabel(score);

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-14 w-14 text-lg',
    lg: 'h-20 w-20 text-2xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} ${bgClass} rounded-full flex items-center justify-center font-bold ${colorClass}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={`mt-1 text-xs font-medium ${colorClass}`}>{label}</span>
      )}
    </div>
  );
}
