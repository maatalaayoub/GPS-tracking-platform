import { Badge } from '@/components/ui/badge';

type DeviceStatus = 'active' | 'inactive' | 'maintenance';

interface StatusBadgeProps {
  status: DeviceStatus;
}

const STATUS_CONFIG: Record<
  DeviceStatus,
  { label: string; variant: 'success' | 'muted' | 'warning' }
> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'muted' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'muted',
  };

  return (
    <Badge variant={variant} className="capitalize">
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
