import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-sm font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
