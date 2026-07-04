import { PageHeader } from '@/components/shared/page-header';
import { DevicesTable } from '@/components/devices/devices-table';
import { createAdminClient } from '@/lib/supabase/server';
import type { Device } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function DevicesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('last_seen_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('[devices] fetch error:', error.message);
  }

  const devices = (data as Device[]) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        description={`${devices.length} registered GPS tracker${devices.length !== 1 ? 's' : ''}`}
      />

      <DevicesTable devices={devices} />
    </div>
  );
}
