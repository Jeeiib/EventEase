// Météo du jour d'un événement : rien pour un événement passé ou sans lieu, une date d'ouverture s'il est trop loin.
import { useCallback, useEffect, useState } from 'react';
import type { EventLocation } from '@/data/types';
import { fetchDailyForecast, type DailyForecast } from '@/services/weather';
import { weatherAvailability } from '@/utils/weatherWindow';

/** `none` : événement passé ou sans lieu ; `tooFar` : prévision pas encore ouverte ; `error` : à réessayer par `retry`. */
export type WeatherState =
  | { status: 'none' }
  | { status: 'tooFar'; availableFrom: Date }
  | { status: 'loading' }
  | { status: 'ready'; forecast: DailyForecast }
  | { status: 'error' };

/** Météo du jour de l'événement ; `retry` relance la requête après une erreur. */
export function useWeather(location: EventLocation | null, startsAt: string, now: Date) {
  const availability = location ? weatherAvailability(startsAt, now) : null;
  const dayKey = availability?.kind === 'available' ? availability.dayKey : null;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const [attempt, setAttempt] = useState(0);
  // Le résultat garde la requête qui l'a produit : un changement de lieu ou de date ne montre jamais l'ancien.
  const [result, setResult] = useState<{ key: string; forecast: DailyForecast | null } | null>(null);
  const key = dayKey && latitude !== undefined ? `${latitude},${longitude},${dayKey},${attempt}` : null;

  useEffect(() => {
    if (!dayKey || latitude === undefined || longitude === undefined) return;
    const requestKey = `${latitude},${longitude},${dayKey},${attempt}`;
    let cancelled = false;
    fetchDailyForecast({ latitude, longitude }, dayKey).then((r) => {
      if (!cancelled) setResult({ key: requestKey, forecast: r.ok ? r.forecast : null });
    });
    return () => {
      cancelled = true;
    };
  }, [dayKey, latitude, longitude, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let state: WeatherState;
  if (!availability || availability.kind === 'past') state = { status: 'none' };
  else if (availability.kind === 'tooFar') state = { status: 'tooFar', availableFrom: availability.availableFrom };
  else if (result?.key !== key) state = { status: 'loading' };
  else state = result.forecast ? { status: 'ready', forecast: result.forecast } : { status: 'error' };

  return { weather: state, retry };
}
