import haversineDistance from "haversine-distance";

interface Point {
  lat: number;
  lng: number;
}

/** Returns straight-line distance in km between two lat/lng points (Haversine). */
export function distanceKm(a: Point, b: Point): number {
  return haversineDistance(a, b) / 1000;
}
