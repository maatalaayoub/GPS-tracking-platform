import { History } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Browse historical GPS position data"
      />
      <EmptyState
        title="Position history coming soon"
        description="Browse and filter historical position data per device with charts and export options."
        icon={<History className="h-6 w-6" />}
      />
    </div>
  );
}
