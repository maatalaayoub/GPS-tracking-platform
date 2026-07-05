'use client';

import dynamic from 'next/dynamic';

import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';

// Leaflet requires the browser's window object — load client-side only.
const LiveMapContainer = dynamic(
  () => import('@/components/map/live-map-container'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full gap-4">
        <Skeleton className="flex-1 rounded-lg" />
        <div className="w-72 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-px w-full" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    ),
  },
);

export default function TrackingPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader
        title="Live Tracking"
        description="Real-time GPS positions via OpenStreetMap + Socket.IO"
      />
      <div className="flex-1 overflow-hidden">
        <LiveMapContainer />
      </div>
    </div>
  );
}
