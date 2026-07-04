import { Cpu, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import type { Device } from '@/types/database';

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <Cpu className="text-muted-foreground h-4 w-4" />
            </div>
            <CardTitle className="text-base">{device.name}</CardTitle>
          </div>
          <StatusBadge status={device.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">IMEI / ID</span>
          <span className="font-mono text-xs">{device.unique_id}</span>
        </div>
        {device.protocol && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Protocol</span>
            <span className="capitalize">{device.protocol}</span>
          </div>
        )}
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>Last seen {formatRelativeTime(device.last_seen_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
