'use client';

import dynamic from 'next/dynamic';

import type { HistoryPosition } from '@/types/tracking';

// Leaflet requires the browser's window object — load client-side only.
const ReplayContainer = dynamic(
  () => import('@/components/history/replay-container'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 h-[400px] animate-pulse rounded-lg border" />
    ),
  },
);

interface HistoryReplaySectionProps {
  positions: HistoryPosition[];
}

export function HistoryReplaySection({ positions }: HistoryReplaySectionProps) {
  return <ReplayContainer positions={positions} />;
}
