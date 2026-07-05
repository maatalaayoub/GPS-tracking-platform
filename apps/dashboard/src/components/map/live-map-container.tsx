'use client';

import { useLiveTracking } from '@/hooks/use-live-tracking';
import { LiveMap } from './live-map';
import { DeviceListPanel } from './device-list-panel';

/**
 * Combines the Socket.IO live-tracking hook with the Leaflet map and
 * the device list sidebar.  Must be dynamically imported with ssr:false
 * in the parent page because Leaflet requires the browser's window object.
 */
export default function LiveMapContainer() {
  const { connected, trackedDevices } = useLiveTracking();

  return (
    <div className="flex h-full gap-4">
      {/* Map */}
      <div className="relative flex-1 overflow-hidden rounded-lg border shadow-sm">
        <LiveMap trackedDevices={trackedDevices} />

        {/* Overlay: connecting badge */}
        {!connected && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 shadow dark:bg-yellow-900/50 dark:text-yellow-200">
            Connecting to server…
          </div>
        )}
      </div>

      {/* Right panel */}
      <DeviceListPanel trackedDevices={trackedDevices} connected={connected} />
    </div>
  );
}
