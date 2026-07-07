import { createAdminClient } from '@/lib/supabase/server';
import type { Device, Position } from '@/types/database';
import type { HistoryFilters, HistoryResult } from '@/types/tracking';

export const HISTORY_PAGE_SIZE = 50;

/**
 * Fetch the list of devices for the history filter dropdown.
 */
export async function fetchHistoryDevices(): Promise<Device[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[history] devices fetch error:', error.message);
    return [];
  }

  return (data as Device[]) ?? [];
}

/**
 * Fetch paginated positions for the history page.
 *
 * Defaults to the last 24 hours if no date range is provided and a device
 * is selected.
 */
export async function fetchHistoryPositions(
  filters: HistoryFilters,
): Promise<HistoryResult> {
  const supabase = createAdminClient();

  const page = Math.max(1, filters.page);
  const from = filters.from;
  const to = filters.to;

  let query = supabase.from('positions').select('*', { count: 'exact' });

  if (filters.deviceId) {
    query = query.eq('device_id', filters.deviceId);
  }

  if (from) {
    query = query.gte('device_time', from);
  }

  if (to) {
    // Extend the end date to include the full day when only a date is given.
    const toDate = new Date(to);
    if (!to.includes('T')) {
      toDate.setHours(23, 59, 59, 999);
    }
    query = query.lte('device_time', toDate.toISOString());
  }

  const { data, error, count } = await query
    .order('device_time', { ascending: false })
    .range((page - 1) * HISTORY_PAGE_SIZE, page * HISTORY_PAGE_SIZE - 1);

  if (error) {
    console.error('[history] positions fetch error:', error.message);
    return {
      positions: [],
      total: 0,
      page,
      pageSize: HISTORY_PAGE_SIZE,
      deviceId: filters.deviceId,
      from,
      to,
    };
  }

  return {
    positions: (data as Position[]) ?? [],
    total: count ?? 0,
    page,
    pageSize: HISTORY_PAGE_SIZE,
    deviceId: filters.deviceId,
    from,
    to,
  };
}
