import { calculateDistance } from '../utils/location';

// Seed stops. Replace with your institution's real stops later.
export const STOPS = [
  { id: 'main', name: 'Main Campus', latitude: 37.78825, longitude: -122.4324 },
  { id: 'north', name: 'North Campus', latitude: 37.78925, longitude: -122.4334 },
  { id: 'south', name: 'South Campus', latitude: 37.78725, longitude: -122.4314 },
];

export const getStopById = (id) => STOPS.find((s) => s.id === id) || null;

export const getNearestStop = (lat, lon) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  let best = null;
  let bestDist = Infinity;
  for (const s of STOPS) {
    const d = calculateDistance(lat, lon, s.latitude, s.longitude);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
};
