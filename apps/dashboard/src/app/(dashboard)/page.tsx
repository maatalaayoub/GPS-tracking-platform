import { Cpu, Activity, XCircle, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { DevicesTable } from '@/components/devices/devices-table';
import { createClient } from '@/lib/supabase/server';
import type { Device } from '@/types/database';

async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalDevices },
    { count: activeDevices },
    { count: inactiveDevices },
    { count: positionsToday },
    { data: recentDevices },
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }),
    supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive'),
    supabase
      .from('positions')
      .select('*', { count: 'exact', head: true })
      .gte('server_time', new Date(Date.now() - 86_400_000).toISOString()),
    supabase
      .from('devices')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(5),
  ]);

  return {
    totalDevices: totalDevices ?? 0,
    activeDevices: activeDevices ?? 0,
    inactiveDevices: inactiveDevices ?? 0,
    positionsToday: positionsToday ?? 0,
    recentDevices: (recentDevices as Device[]) ?? [],
  };
}

export default async function DashboardPage() {
  const {
    totalDevices,
    activeDevices,
    inactiveDevices,
    positionsToday,
    recentDevices,
  } = await getDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your GPS tracking platform"
      />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Devices"
          value={totalDevices}
          description="Registered GPS trackers"
          icon={<Cpu className="text-muted-foreground h-4 w-4" />}
        />
        <StatsCard
          title="Active Devices"
          value={activeDevices}
          description="Currently online"
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
        />
        <StatsCard
          title="Inactive Devices"
          value={inactiveDevices}
          description="Offline or unreachable"
          icon={<XCircle className="text-muted-foreground h-4 w-4" />}
        />
        <StatsCard
          title="Positions Today"
          value={positionsToday}
          description="GPS fixes in the last 24 hours"
          icon={<MapPin className="h-4 w-4 text-blue-500" />}
        />
      </div>

      {/* Recent devices */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recently Active Devices</h2>
        <DevicesTable devices={recentDevices} />
      </div>
    </div>
  );
}
