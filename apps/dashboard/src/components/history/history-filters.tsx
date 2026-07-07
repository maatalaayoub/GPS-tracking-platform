'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Calendar, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Device } from '@/types/database';

interface HistoryFiltersProps {
  devices: Device[];
  deviceId: string | null;
  from: string | null;
  to: string | null;
}

export function HistoryFilters({
  devices,
  deviceId,
  from,
  to,
}: HistoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const params = new URLSearchParams(searchParams.toString());
    const newDeviceId = formData.get('deviceId') as string;
    const newFrom = formData.get('from') as string;
    const newTo = formData.get('to') as string;

    if (newDeviceId) {
      params.set('deviceId', newDeviceId);
    } else {
      params.delete('deviceId');
    }

    if (newFrom) {
      params.set('from', newFrom);
    } else {
      params.delete('from');
    }

    if (newTo) {
      params.set('to', newTo);
    } else {
      params.delete('to');
    }

    // Reset to page 1 when filters change.
    params.delete('page');

    startTransition(() => {
      router.push(`/history?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end"
    >
      <div className="grid flex-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="deviceId" className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            Device
          </Label>
          <select
            id="deviceId"
            name="deviceId"
            defaultValue={deviceId ?? ''}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <option value="">All devices</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.unique_id})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from" className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            From
          </Label>
          <Input
            id="from"
            name="from"
            type="datetime-local"
            defaultValue={from ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to" className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            To
          </Label>
          <Input
            id="to"
            name="to"
            type="datetime-local"
            defaultValue={to ?? ''}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="sm:w-auto">
        <Search className="mr-2 h-4 w-4" />
        {isPending ? 'Loading…' : 'Apply'}
      </Button>
    </form>
  );
}
