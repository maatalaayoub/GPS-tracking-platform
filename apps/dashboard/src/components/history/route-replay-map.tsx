'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

import type { HistoryPosition } from '@/types/tracking';

// ── Custom SVG marker for the replay cursor ──────────────────────────────────

const CURSOR_ICON = L.divIcon({
  className: '',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.25">
        <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

// ── Auto-fit to the route once ───────────────────────────────────────────────

function AutoFit({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (bounds.length === 0 || fitted.current) return;

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
    fitted.current = true;
  }, [bounds, map]);

  return null;
}

// ── Main replay map ──────────────────────────────────────────────────────────

interface RouteReplayMapProps {
  positions: HistoryPosition[];
  currentIndex: number;
}

const DEFAULT_CENTER: [number, number] = [36.7372, 3.0868];

export function RouteReplayMap({
  positions,
  currentIndex,
}: RouteReplayMapProps) {
  const route = useMemo(
    () => positions.map((p) => [p.latitude, p.longitude] as [number, number]),
    [positions],
  );

  const currentPosition = positions[currentIndex];

  if (route.length === 0) {
    return (
      <div className="bg-muted/30 flex h-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">
          Select a device and date range to view the route replay.
        </p>
      </div>
    );
  }

  return (
    <MapContainer
      center={route[0] ?? DEFAULT_CENTER}
      zoom={14}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Full route trace */}
      <Polyline
        positions={route}
        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7 }}
      />

      {/* Current position cursor */}
      {currentPosition && (
        <Marker
          position={[currentPosition.latitude, currentPosition.longitude]}
          icon={CURSOR_ICON}
        >
          <Popup minWidth={180}>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Replay Position</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                <span className="text-gray-500">Time</span>
                <span>
                  {currentPosition.device_time
                    ? new Date(currentPosition.device_time).toLocaleString()
                    : '—'}
                </span>
                <span className="text-gray-500">Speed</span>
                <span>
                  {currentPosition.speed != null
                    ? `${currentPosition.speed.toFixed(1)} km/h`
                    : '—'}
                </span>
                <span className="text-gray-500">Heading</span>
                <span>
                  {currentPosition.heading != null
                    ? `${currentPosition.heading.toFixed(0)}°`
                    : '—'}
                </span>
                <span className="text-gray-500">Lat</span>
                <span>{currentPosition.latitude.toFixed(6)}</span>
                <span className="text-gray-500">Lng</span>
                <span>{currentPosition.longitude.toFixed(6)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      <AutoFit bounds={route} />
    </MapContainer>
  );
}
