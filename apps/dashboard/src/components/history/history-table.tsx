'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { History } from 'lucide-react';
import type { HistoryPosition } from '@/types/tracking';

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

interface HistoryTableProps {
  positions: HistoryPosition[];
}

export function HistoryTable({ positions }: HistoryTableProps) {
  if (positions.length === 0) {
    return (
      <EmptyState
        title="No positions found"
        description="Try adjusting the date range or select a different device."
        icon={<History className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device Time</TableHead>
            <TableHead>Server Time</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Heading</TableHead>
            <TableHead>Sats</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell className="font-medium">
                {formatDateTime(position.device_time)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(position.server_time)}
              </TableCell>
              <TableCell>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {formatCoordinate(position.latitude)}
                </code>
              </TableCell>
              <TableCell>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {formatCoordinate(position.longitude)}
                </code>
              </TableCell>
              <TableCell>
                {position.speed != null
                  ? `${position.speed.toFixed(1)} km/h`
                  : '—'}
              </TableCell>
              <TableCell>
                {position.heading != null
                  ? `${position.heading.toFixed(0)}°`
                  : '—'}
              </TableCell>
              <TableCell>{position.satellites ?? '—'}</TableCell>
              <TableCell>
                {position.valid ? (
                  <Badge variant="success">Valid</Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
