import { Cpu } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './status-badge';
import { EmptyState } from '@/components/shared/empty-state';
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

interface DevicesTableProps {
  devices: Device[];
}

export function DevicesTable({ devices }: DevicesTableProps) {
  if (devices.length === 0) {
    return (
      <EmptyState
        title="No devices yet"
        description="Connect a GPS tracker or run the simulator to register your first device."
        icon={<Cpu className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Unique ID / IMEI</TableHead>
            <TableHead>Protocol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">{device.name}</TableCell>
              <TableCell>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {device.unique_id}
                </code>
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {device.protocol ?? '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={device.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                <span title={formatDate(device.last_seen_at)}>
                  {formatRelativeTime(device.last_seen_at)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(device.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
