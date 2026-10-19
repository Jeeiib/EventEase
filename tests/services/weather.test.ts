// Service météo : correspondance des codes WMO, URL demandée, erreurs réseau et API.
import { fetchDailyForecast, weatherCodeToKind } from '@/services/weather';

const loc = { latitude: 48.85, longitude: 2.35 };

function fakeFetch(status: number, body: unknown) {
  return jest.fn(async () => ({ status, json: async () => body }) as Response);
}

describe('weatherCodeToKind', () => {
  it.each([
    [0, 'clear'],
    [2, 'partlyCloudy'],
    [3, 'overcast'],
    [45, 'fog'],
    [53, 'drizzle'],
    [61, 'rain'],
    [75, 'snow'],
    [80, 'showers'],
    [96, 'thunderstorm'],
    [999, 'overcast'],
  ])('code %i donne %s', (code, kind) => {
    expect(weatherCodeToKind(code)).toBe(kind);
  });
});

describe('fetchDailyForecast', () => {
  it("construit l'URL attendue et arrondit les températures", async () => {
    const fetchFn = fakeFetch(200, {
      daily: {
        weather_code: [2],
        temperature_2m_max: [13.6],
        temperature_2m_min: [8.4],
      },
    });
    const result = await fetchDailyForecast(loc, '2026-10-24', fetchFn);
    expect(result).toEqual({
      ok: true,
      forecast: { kind: 'partlyCloudy', tempMin: 8, tempMax: 14 },
    });
    const url = (fetchFn.mock.calls[0] as unknown as [string])[0];
    expect(url).toContain('latitude=48.85&longitude=2.35');
    expect(url).toContain('start_date=2026-10-24&end_date=2026-10-24');
    expect(url).toContain('timezone=Europe%2FParis');
  });

  it('un statut 400 donne unavailable', async () => {
    expect(await fetchDailyForecast(loc, '2026-10-24', fakeFetch(400, {}))).toEqual({
      ok: false,
      error: 'unavailable',
    });
  });

  it('un JSON sans daily donne unavailable', async () => {
    expect(await fetchDailyForecast(loc, '2026-10-24', fakeFetch(200, {}))).toEqual({
      ok: false,
      error: 'unavailable',
    });
  });

  it('un fetch qui rejette donne network', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    expect(await fetchDailyForecast(loc, '2026-10-24', fetchFn)).toEqual({
      ok: false,
      error: 'network',
    });
  });

  it('abandonne après 8 s et compte cela comme network', async () => {
    jest.useFakeTimers();
    try {
      const hanging = jest.fn(
        (_url: unknown, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      );
      const pending = fetchDailyForecast(loc, '2026-10-24', hanging as unknown as typeof fetch);
      await jest.advanceTimersByTimeAsync(8000);
      expect(await pending).toEqual({ ok: false, error: 'network' });
    } finally {
      jest.useRealTimers();
    }
  });

  it("un 200 qui n'est pas du JSON donne unavailable", async () => {
    const fetchFn = jest.fn(async () => ({ status: 200, json: () => Promise.reject(new SyntaxError()) }) as Response);
    expect(await fetchDailyForecast(loc, '2026-10-24', fetchFn)).toEqual({ ok: false, error: 'unavailable' });
  });
});
