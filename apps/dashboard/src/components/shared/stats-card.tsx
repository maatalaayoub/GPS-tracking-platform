import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-card space-y-3 rounded-lg border p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </div>
    </div>
  );
}
