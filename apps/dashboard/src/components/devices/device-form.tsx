'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDevice, type DeviceFormData } from '@/lib/devices';
import type { Device } from '@/types/database';

interface DeviceFormProps {
  device: Device;
}

export function DeviceForm({ device }: DeviceFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<DeviceFormData>({
    name: device.name,
    status: device.status,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const result = await updateDevice(device.id, formData);

    setIsPending(false);

    if (!result.success) {
      alert(result.error ?? 'Failed to update device');
      return;
    }

    router.push('/devices');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Device Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          minLength={1}
          placeholder="e.g. Truck A-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uniqueId">Unique ID / IMEI</Label>
        <Input
          id="uniqueId"
          name="uniqueId"
          value={device.unique_id}
          disabled
          className="bg-muted"
        />
        <p className="text-muted-foreground text-xs">
          The unique identifier is set when the device first connects and cannot
          be changed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as Device['status'],
            }))
          }
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/devices')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
