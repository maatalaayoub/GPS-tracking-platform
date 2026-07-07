'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { deleteDevice } from '@/lib/devices';
import type { Device } from '@/types/database';

interface DeviceActionsProps {
  device: Device;
}

export function DeviceActions({ device }: DeviceActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete device "${device.name}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteDevice(device.id);

    if (!result.success) {
      alert(result.error ?? 'Failed to delete device');
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border bg-white p-1 shadow-lg dark:bg-gray-900">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(`/devices/${device.id}`);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleDelete();
              }}
              disabled={isDeleting}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
