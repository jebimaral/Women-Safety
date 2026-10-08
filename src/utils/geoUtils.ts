import { GeofenceZone, LocationPoint } from '../types';

/**
 * Calculates distance in meters between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a location is inside a geofence zone
 */
export function isLocationInGeofence(
  location: { lat: number; lng: number },
  zone: GeofenceZone
): boolean {
  const distance = calculateDistanceMeters(
    location.lat,
    location.lng,
    zone.lat,
    zone.lng
  );
  return distance <= zone.radiusMeters;
}

/**
 * Formats distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Generate a simulated next location along a direction
 */
export function simulateMovement(
  current: LocationPoint,
  headingDegrees: number = 45,
  distanceMeters: number = 100
): LocationPoint {
  const R = 6371e3; // Earth's radius in meters
  const brng = (headingDegrees * Math.PI) / 180;
  const d = distanceMeters;

  const lat1 = (current.lat * Math.PI) / 180;
  const lon1 = (current.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  const newLat = (lat2 * 180) / Math.PI;
  const newLng = (lon2 * 180) / Math.PI;

  return {
    lat: Number(newLat.toFixed(6)),
    lng: Number(newLng.toFixed(6)),
    address: current.address,
    speedKmH: Math.floor(Math.random() * 8) + 3,
    accuracyMeters: 5,
  };
}
