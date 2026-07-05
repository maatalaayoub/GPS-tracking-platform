'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import type { TrackedDevice } from '@/types/tracking';

// ── Custom SVG marker (avoids Webpack/Next.js default-icon path issues) ──────

function createDeviceIcon(status: 'active' | 'inactive' | 'maintenance') {
  const color =
    status === 'active'
      ? '#10b981'
      : status === 'maintenance'
        ? '#f59e0b'
        : '#6b7280';

  const pulse =
    status === 'active'
      ? `<circle cx="12" cy="12" r="10" fill="${color}" opacity="0.2">
           <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
           <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite"/>
         </circle>`
      : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      ${pulse}
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>`;

  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

// ── Auto-fit to all device markers ───────────────────────────────────────────

function AutoFit({
  trackedDevices,
}: {
  trackedDevices: Map<string, TrackedDevice>;
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (trackedDevices.size === 0 || fitted.current) return;

    const positions = Array.from(trackedDevices.values()).map(
      ({ position }) =>
        [position.latitude, position.longitude] as [number, number],
    );

    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
    fitted.current = true;
  }, [trackedDevices, map]);

  return null;
}

// ── Main Leaflet map ──────────────────────────────────────────────────────────

interface LiveMapProps {
  trackedDevices: Map<string, TrackedDevice>;
}

/** Default center: Algiers. */
const DEFAULT_CENTER: [number, number] = [36.7372, 3.0868];

export function LiveMap({ trackedDevices }: LiveMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={12}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {Array.from(trackedDevices.values()).map(
        ({ device, position, updatedAt }) => (
          <Marker
            key={device.id}
            position={[position.latitude, position.longitude]}
            icon={createDeviceIcon(device.status)}
          >
            <Popup minWidth={200}>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {device.name || device.uniqueId}
                </p>
                <p className="font-mono text-xs text-gray-500">
                  {device.uniqueId}
                </p>
                <hr />
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                  <span className="text-gray-500">Speed</span>
                  <span>
                    {position.speed != null
                      ? `${position.speed.toFixed(1)} km/h`
                      : '—'}
                  </span>
                  <span className="text-gray-500">Heading</span>
                  <span>
                    {position.heading != null
                      ? `${position.heading.toFixed(0)}°`
                      : '—'}
                  </span>
                  <span className="text-gray-500">Satellites</span>
                  <span>{position.satellites ?? '—'}</span>
                  <span className="text-gray-500">Lat</span>
                  <span>{position.latitude.toFixed(6)}</span>
                  <span className="text-gray-500">Lng</span>
                  <span>{position.longitude.toFixed(6)}</span>
                  <span className="text-gray-500">Updated</span>
                  <span>{updatedAt.toLocaleTimeString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ),
      )}

      <AutoFit trackedDevices={trackedDevices} />
    </MapContainer>
  );
}
