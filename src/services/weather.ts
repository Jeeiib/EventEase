// Prévision du jour d'un événement via Open-Meteo (sans clé d'API).
export type WeatherKind =
  'clear' | 'partlyCloudy' | 'overcast' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'showers' | 'thunderstorm';

export type DailyForecast = {
  kind: WeatherKind;
  tempMin: number;
  tempMax: number;
};

export type ForecastResult = { ok: true; forecast: DailyForecast } | { ok: false; error: 'network' | 'unavailable' };

// La météo est un plus : après 8 s on abandonne plutôt que de laisser la fiche attendre.
const TIMEOUT_MS = 8000;

/** Regroupe les codes météo WMO en neuf familles ; un code inconnu reste neutre (`overcast`) plutôt que d'afficher une météo fausse. */
export function weatherCodeToKind(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partlyCloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'overcast';
}

/**
 * Prévision d'un seul jour (`dayKey`, « AAAA-MM-JJ », heure de Paris) à l'endroit `loc`.
 * Ne lève jamais : `unavailable` si l'API répond mal, `network` si le réseau coupe ou si 8 s s'écoulent.
 */
export async function fetchDailyForecast(
  loc: { latitude: number; longitude: number },
  dayKey: string,
  fetchFn: typeof fetch = fetch,
): Promise<ForecastResult> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${loc.latitude}&longitude=${loc.longitude}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    `&timezone=Europe%2FParis&start_date=${dayKey}&end_date=${dayKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchFn(url, { signal: controller.signal });
    if (res.status !== 200) return { ok: false, error: 'unavailable' };
    // Un 200 qui n'est pas du JSON (portail Wi-Fi, proxy) : l'API n'a pas vraiment répondu.
    const json = await res.json().catch(() => null);
    const code = json?.daily?.weather_code?.[0];
    const max = json?.daily?.temperature_2m_max?.[0];
    const min = json?.daily?.temperature_2m_min?.[0];
    if (typeof code !== 'number' || typeof max !== 'number' || typeof min !== 'number') {
      return { ok: false, error: 'unavailable' };
    }
    return {
      ok: true,
      forecast: {
        kind: weatherCodeToKind(code),
        tempMin: Math.round(min),
        tempMax: Math.round(max),
      },
    };
  } catch {
    // Réseau coupé ou délai dépassé : dans les deux cas l'API n'a pas répondu.
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
