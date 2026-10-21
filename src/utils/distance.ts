// Distance à vol d'oiseau entre deux points et son affichage.
import { getAppLocale } from '@/i18n';

type Point = { latitude: number; longitude: number };

const EARTH_RADIUS_M = 6371008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distance à vol d'oiseau en mètres (formule de haversine, rayon terrestre moyen). */
export function distanceMeters(a: Point, b: Point): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

function unit(value: number, unit: 'meter' | 'kilometer', maximumFractionDigits: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits }).format(
    value,
  );
}

/** « 450 m », « 3,4 km », « 12 km » : arrondi à 10 m sous 1 km, à 100 m sous 10 km, au kilomètre au-delà. */
export function formatDistance(meters: number, locale: string = getAppLocale()): string {
  const rounded = Math.round(meters / 10) * 10; // arrondi avant le seuil : 996 m s'affiche « 1 km », pas « 1000 m »
  if (rounded < 1000) return unit(rounded, 'meter', 0, locale);
  // Hermes ignore maximumFractionDigits avec style « unit » : on arrondit nous-mêmes.
  const km = meters < 10000 ? Math.round(meters / 100) / 10 : Math.round(meters / 1000);
  return unit(km, 'kilometer', meters < 10000 ? 1 : 0, locale);
}
