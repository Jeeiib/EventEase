// Fenêtre de prévision météo : d'aujourd'hui à J+15 inclus.
import { addDays, fromDayKey, isUpcoming, toDayKey } from '@/utils/dates';

const FORECAST_DAYS = 15;

/** `past` : rien à afficher ; `available` : prévision demandable pour `dayKey` ; `tooFar` : trop tôt, `availableFrom` est le premier jour d'ouverture. */
export type WeatherAvailability =
  { kind: 'past' } | { kind: 'available'; dayKey: string } | { kind: 'tooFar'; availableFrom: Date };

/** Dit si une prévision existe pour l'événement : l'API couvre d'aujourd'hui à J+15 inclus. */
export function weatherAvailability(startsAtIso: string, now: Date): WeatherAvailability {
  if (!isUpcoming(startsAtIso, now)) return { kind: 'past' };
  const dayKey = toDayKey(new Date(startsAtIso));
  if (dayKey <= toDayKey(addDays(now, FORECAST_DAYS))) return { kind: 'available', dayKey };
  return { kind: 'tooFar', availableFrom: addDays(fromDayKey(dayKey), -FORECAST_DAYS) };
}
