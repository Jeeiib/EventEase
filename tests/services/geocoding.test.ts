// Service d'adresses : seuil de saisie, lecture du GeoJSON, erreurs réseau et API.
import { searchAddress } from '@/services/geocoding';

function fakeFetch(status: number, body: unknown) {
  return jest.fn(async () => ({ status, json: async () => body }) as Response);
}

describe('searchAddress', () => {
  it('ne fait aucun appel sous trois caractères', async () => {
    const fetchFn = fakeFetch(200, {});
    expect(await searchAddress(' la ', fetchFn)).toEqual({
      ok: true,
      hits: [],
    });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('lit les features avec la latitude en seconde coordonnée', async () => {
    const fetchFn = fakeFetch(200, {
      features: [
        {
          properties: { label: '1 rue de Rivoli 75001 Paris' },
          geometry: { coordinates: [2.34, 48.86] },
        },
        {
          properties: { label: '2 rue de Rivoli 75004 Paris' },
          geometry: { coordinates: [2.36, 48.85] },
        },
      ],
    });
    const result = await searchAddress('rue de Rivoli', fetchFn);
    expect(result).toEqual({
      ok: true,
      hits: [
        {
          label: '1 rue de Rivoli 75001 Paris',
          latitude: 48.86,
          longitude: 2.34,
        },
        {
          label: '2 rue de Rivoli 75004 Paris',
          latitude: 48.85,
          longitude: 2.36,
        },
      ],
    });
    const url = (fetchFn.mock.calls[0] as unknown as [string])[0];
    expect(url).toBe('https://data.geopf.fr/geocodage/search?q=rue%20de%20Rivoli&autocomplete=1&limit=5');
  });

  it('transmet le signal à fetch', async () => {
    const fetchFn = fakeFetch(200, { features: [] });
    const { signal } = new AbortController();
    await searchAddress('paris', fetchFn, signal);
    expect((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].signal).toBe(signal);
  });

  it('un statut 500 donne unavailable', async () => {
    expect(await searchAddress('paris', fakeFetch(500, {}))).toEqual({
      ok: false,
      error: 'unavailable',
    });
  });

  it('un fetch qui rejette donne network', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('aborted'));
    expect(await searchAddress('paris', fetchFn)).toEqual({
      ok: false,
      error: 'network',
    });
  });

  it('ignore un résultat sans coordonnées numériques', async () => {
    const body = {
      features: [
        { properties: { label: 'Vide' }, geometry: { coordinates: [] } },
        { properties: { label: 'Texte' }, geometry: { coordinates: ['a', 'b'] } },
        { properties: { label: 'Bon' }, geometry: { coordinates: [3.12, 50.67] } },
      ],
    };
    expect(await searchAddress('wasquehal', fakeFetch(200, body))).toEqual({
      ok: true,
      hits: [{ label: 'Bon', latitude: 50.67, longitude: 3.12 }],
    });
  });

  it("un 200 qui n'est pas du JSON donne unavailable", async () => {
    const fetchFn = jest.fn(async () => ({ status: 200, json: () => Promise.reject(new SyntaxError()) }) as Response);
    expect(await searchAddress('paris', fetchFn)).toEqual({ ok: false, error: 'unavailable' });
  });
});
