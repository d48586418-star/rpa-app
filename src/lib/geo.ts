import { norm } from './matching';

// Coordenadas aproximadas dos centros das cidades (suficientes para estimar distância).
const CITIES = [
  { name: 'Ilhéus', lat: -14.789, lng: -39.049 },
  { name: 'Itabuna', lat: -14.788, lng: -39.278 },
  { name: 'Itacaré', lat: -14.278, lng: -38.997 },
  { name: 'Una', lat: -15.293, lng: -39.075 },
  { name: 'Canavieiras', lat: -15.675, lng: -38.948 },
  { name: 'Valença', lat: -13.37, lng: -39.073 },
  { name: 'Porto Seguro', lat: -16.444, lng: -39.064 },
  { name: 'Trancoso', lat: -16.591, lng: -39.096 },
] as const;

export const CITY_NAMES: string[] = CITIES.map((c) => c.name);

const find = (name?: string | null) => (name ? CITIES.find((c) => norm(c.name) === norm(name)) : undefined);

/** Distância em linha reta (haversine), em km. null quando alguma cidade é desconhecida. */
export function distanceKm(a?: string | null, b?: string | null): number | null {
  const A = find(a);
  const B = find(b);
  if (!A || !B) return null;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(B.lat - A.lat);
  const dLng = rad(B.lng - A.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(A.lat)) * Math.cos(rad(B.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
