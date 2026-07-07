import { Suspense } from 'react';

import { PageHeader } from '@/components/shared/page-header';
import { HistoryFilters } from '@/components/history/history-filters';
import { HistoryTable } from '@/components/history/history-table';
import { HistoryPagination } from '@/components/history/history-pagination';
import { HistoryReplaySection } from '@/components/history/history-replay-section';
import { fetchHistoryDevices, fetchHistoryPositions } from '@/lib/history';

interface HistoryPageProps {
  searchParams: Promise<{
    deviceId?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;

  const deviceId = params.deviceId ?? null;
  const from = params.from ?? null;
  const to = params.to ?? null;
  const page = Number(params.page ?? '1');

  const [devices, result] = await Promise.all([
    fetchHistoryDevices(),
    fetchHistoryPositions({ deviceId, from, to, page }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Browse historical GPS position data and replay routes"
      />

      <HistoryFilters
        devices={devices}
        deviceId={deviceId}
        from={from}
        to={to}
      />

      <Suspense
        fallback={
          <div className="bg-muted/30 h-[400px] animate-pulse rounded-lg border" />
        }
      >
        <HistoryReplaySection positions={result.positions} />
      </Suspense>

      <HistoryTable positions={result.positions} />

      <HistoryPagination total={result.total} page={result.page} />
    </div>
  );
}
