'use client';

import { Clock, Navigation, Satellite, Wifi, WifiOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import type { TrackedDevice } from '@/types/tracking';

interface DeviceListPanelProps {
  trackedDevices: Map<string, TrackedDevice>;
  connected: boolean;
}

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export function DeviceListPanel({
  trackedDevices,
  connected,
}: DeviceListPanelProps) {
  const devices = Array.from(trackedDevices.values());

  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-3">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {trackedDevices.size} device{trackedDevices.size !== 1 ? 's' : ''}{' '}
          tracked
        </span>
        <Badge variant={connected ? 'success' : 'muted'} className="gap-1">
          {connected ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {connected ? 'Live' : 'Disconnected'}
        </Badge>
      </div>

      <Separator />

      {/* Device list */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {devices.length === 0 ? (
          <EmptyState
            title="No devices yet"
            description="Start the TCP server and simulator to see live positions here."
            icon={<Navigation className="h-5 w-5" />}
          />
        ) : (
          devices.map(({ device, position, updatedAt }) => (
            <Card key={device.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="px-3 pb-2 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate text-sm">
                    {device.name || device.uniqueId}
                  </CardTitle>
                  <Badge
                    variant={
                      device.status === 'active'
                        ? 'success'
                        : device.status === 'maintenance'
                          ? 'warning'
                          : 'muted'
                    }
                    className="shrink-0 text-xs"
                  >
                    {device.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-mono text-xs">
                  {device.uniqueId}
                </p>
              </CardHeader>
              <CardContent className="space-y-1 px-3 pb-3">
                <div className="grid grid-cols-2 gap-x-2 text-xs">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    <span>
                      {position.speed != null
                        ? `${position.speed.toFixed(0)} km/h`
                        : '— km/h'}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Satellite className="h-3 w-3" />
                    <span>{position.satellites ?? '—'} sats</span>
                  </div>
                </div>
                <p className="text-muted-foreground font-mono text-xs">
                  {position.latitude.toFixed(5)},{' '}
                  {position.longitude.toFixed(5)}
                </p>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{relativeTime(updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
