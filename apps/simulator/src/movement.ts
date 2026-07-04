const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Move a lat/lng point in a given compass direction by `distanceM` metres.
 * Uses the spherical Earth projection (Haversine forward formula).
 */
export function movePoint(
  lat: number,
  lng: number,
  headingDeg: number,
  distanceM: number,
): { latitude: number; longitude: number } {
  if (distanceM === 0) return { latitude: lat, longitude: lng };

  const d = distanceM / EARTH_RADIUS_M;
  const bearing = toRad(headingDeg);
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );

  return { latitude: toDeg(lat2), longitude: toDeg(lng2) };
}

/**
 * Initial compass bearing (degrees 0-360) from point A to point B.
 */
export function bearingBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const lat1R = toRad(lat1);
  const lat2R = toRad(lat2);
  const dLng = toRad(lng2 - lng1);

  const x = Math.sin(dLng) * Math.cos(lat2R);
  const y =
    Math.cos(lat1R) * Math.sin(lat2R) -
    Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);

  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}

/**
 * Great-circle distance in metres between two lat/lng coordinates.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
