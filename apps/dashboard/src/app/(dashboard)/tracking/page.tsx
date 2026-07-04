import { MapPin } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Tracking"
        description="Real-time GPS device tracking on a map"
      />
      <EmptyState
        title="Live map coming in Phase 7"
        description="Real-time tracking with Socket.IO and an interactive map will be implemented in the next phase."
        icon={<MapPin className="h-6 w-6" />}
      />
    </div>
  );
}
