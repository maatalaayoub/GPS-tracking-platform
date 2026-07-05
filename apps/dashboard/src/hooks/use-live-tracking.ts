'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { LiveDevice, LivePosition, TrackedDevice } from '@/types/tracking';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

const POSITION_EVENT = 'position:update';
const DEVICE_EVENT = 'device:status';

export function useLiveTracking() {
  const [connected, setConnected] = useState(false);
  const [trackedDevices, setTrackedDevices] = useState<
    Map<string, TrackedDevice>
  >(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on(POSITION_EVENT, (position: LivePosition) => {
      setTrackedDevices((prev) => {
        const next = new Map(prev);
        const existing = next.get(position.deviceId);

        // Preserve device info if we already have it; create a placeholder otherwise.
        const device: LiveDevice = existing?.device ?? {
          id: position.deviceId,
          uniqueId: position.deviceId,
          name: position.deviceId,
          status: 'active',
          protocol: position.protocol ?? null,
          ownerId: null,
          lastSeenAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        next.set(position.deviceId, {
          device,
          position,
          updatedAt: new Date(),
        });
        return next;
      });
    });

    socket.on(DEVICE_EVENT, (device: LiveDevice) => {
      setTrackedDevices((prev) => {
        const next = new Map(prev);
        const existing = next.get(device.id);
        if (existing) {
          next.set(device.id, { ...existing, device, updatedAt: new Date() });
        }
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const deviceCount = trackedDevices.size;
  const activeCount = Array.from(trackedDevices.values()).filter(
    (d) => d.device.status === 'active',
  ).length;

  return { connected, trackedDevices, deviceCount, activeCount };
}
