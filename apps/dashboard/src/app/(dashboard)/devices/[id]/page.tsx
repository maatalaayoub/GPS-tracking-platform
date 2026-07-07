import { notFound } from 'next/navigation';
import { ArrowLeft, Cpu } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { DeviceForm } from '@/components/devices/device-form';
import { StatusBadge } from '@/components/devices/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDevice } from '@/lib/devices';

interface DeviceDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function DeviceDetailPage({
  params,
}: DeviceDetailPageProps) {
  const { id } = await params;
  const device = await fetchDevice(id);

  if (!device) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={device.name}
        description={`Manage device settings and status`}
      >
        <Link
          href="/devices"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to devices
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceForm device={device} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  <Cpu className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <StatusBadge status={device.status} />
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Unique ID</p>
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {device.unique_id}
                </code>
              </div>

              {device.protocol && (
                <div>
                  <p className="text-muted-foreground text-xs">Protocol</p>
                  <p className="text-sm capitalize">{device.protocol}</p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground text-xs">Registered</p>
                <p className="text-sm">
                  {new Date(device.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Last Updated</p>
                <p className="text-sm">
                  {new Date(device.updated_at).toLocaleString()}
                </p>
              </div>

              {device.last_seen_at && (
                <div>
                  <p className="text-muted-foreground text-xs">Last Seen</p>
                  <p className="text-sm">
                    {new Date(device.last_seen_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
