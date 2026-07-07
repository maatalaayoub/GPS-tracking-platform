'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createAdminClient } from '@/lib/supabase/server';
import type { Device } from '@/types/database';

export type DeviceFormData = {
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
};

/**
 * Fetch a single device by its internal UUID.
 */
export async function fetchDevice(id: string): Promise<Device | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[devices] fetch single error:', error.message);
    return null;
  }

  return (data as Device) ?? null;
}

/**
 * Update a device's editable fields.
 */
export async function updateDevice(
  id: string,
  formData: DeviceFormData,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('devices')
    .update({
      name: formData.name.trim(),
      status: formData.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[devices] update error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/devices');
  revalidatePath(`/devices/${id}`);
  return { success: true };
}

/**
 * Delete a device and all its positions (cascade).
 */
export async function deleteDevice(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('devices').delete().eq('id', id);

  if (error) {
    console.error('[devices] delete error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/devices');
  redirect('/devices');
}
