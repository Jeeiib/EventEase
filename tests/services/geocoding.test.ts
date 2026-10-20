// Service d'adresses : seuil de saisie, adresses et lieux, doublons, priorité locale, erreurs réseau et API.
import { searchAddress } from '@/services/geocoding';

function fakeFetch(status: number, body: unknown) {
  return jest.fn(async () => ({ status, json: async () => body }) as Response);
}

const adresse = {
  properties: {
    _type: 'address',
    label: 'Rue de Barbieux 59100 Roubaix',
    name: 'Rue de Barbieux',
    postcode: '59100',
    city: 'Roubaix',
  },
  geometry: { coordinates: [3.17, 50.68] },
};

const lieu = {
  properties: {
    _type: 'poi',
    toponym: 'Parc Barbieux',
    name: ['Parc Barbieux'],
    postcode: ['59100'],
    city: ['Roubaix'],
  },
  geometry: { coordinates: [3.16, 50.67] },
};

const urlAppelee = (fetchFn: jest.Mock) => (fetchFn.mock.calls[0] as unknown as [string])[0];

describe('searchAddress', () => {
  it('ne fait aucun appel sous trois caractères', async () => {
    const fetchFn = fakeFetch(200, {});
    expect(await searchAddress(' la ', { fetchFn })).toEqual({
      ok: true,
      hits: [],
    });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('interroge les adresses et les lieux', async () => {
    const fetchFn = fakeFetch(200, { features: [] });
    await searchAddress('lac du heron', { fetchFn });
    expect(urlAppelee(fetchFn)).toBe(
      'https://data.geopf.fr/geocodage/search?q=lac%20du%20heron&autocomplete=1&limit=5&index=address,poi',
    );
  });

  it('ajoute lat et lon quand near est fourni', async () => {
    const fetchFn = fakeFetch(200, { features: [] });
    await searchAddress('156 rue leon jou', { fetchFn, near: { latitude: 50.67, longitude: 3.12 } });
    expect(urlAppelee(fetchFn)).toBe(
      'https://data.geopf.fr/geocodage/search?q=156%20rue%20leon%20jou&autocomplete=1&limit=5&index=address,poi&lat=50.67&lon=3.12',
    );
  });

  it('lit une adresse et un lieu avec la latitude en seconde coordonnée', async () => {
    const result = await searchAddress('barbieux', { fetchFn: fakeFetch(200, { features: [adresse, lieu] }) });
    expect(result).toEqual({
      ok: true,
      hits: [
        {
          label: 'Rue de Barbieux, Roubaix',
          name: 'Rue de Barbieux',
          place: '59100 Roubaix',
          latitude: 50.68,
          longitude: 3.17,
        },
        {
          label: 'Parc Barbieux, Roubaix',
          name: 'Parc Barbieux',
          place: '59100 Roubaix',
          latitude: 50.67,
          longitude: 3.16,
        },
      ],
    });
  });

  it('retire les doublons', async () => {
    const result = await searchAddress('parc barbieux', { fetchFn: fakeFetch(200, { features: [lieu, lieu] }) });
    expect(result).toEqual({
      ok: true,
      hits: [
        {
          label: 'Parc Barbieux, Roubaix',
          name: 'Parc Barbieux',
          place: '59100 Roubaix',
          latitude: 50.67,
          longitude: 3.16,
        },
      ],
    });
  });

  it('affiche la ville seule quand le code postal manque', async () => {
    const sansCode = {
      properties: { toponym: 'Lac du Héron', name: ['Lac du Héron'], city: ['Villeneuve-d’Ascq'] },
      geometry: { coordinates: [3.17, 50.62] },
    };
    const result = await searchAddress('lac du heron', { fetchFn: fakeFetch(200, { features: [sansCode] }) });
    expect(result).toMatchObject({
      ok: true,
      hits: [{ label: 'Lac du Héron, Villeneuve-d’Ascq', place: 'Villeneuve-d’Ascq' }],
    });
  });

  it('ignore un lieu sans ville', async () => {
    const sansVille = { ...lieu, properties: { ...lieu.properties, city: [] } };
    const result = await searchAddress('parc barbieux', { fetchFn: fakeFetch(200, { features: [sansVille] }) });
    expect(result).toEqual({ ok: true, hits: [] });
  });

  it('transmet le signal à fetch', async () => {
    const fetchFn = fakeFetch(200, { features: [] });
    const { signal } = new AbortController();
    await searchAddress('paris', { fetchFn, signal });
    expect((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].signal).toBe(signal);
  });

  it('un statut 500 donne unavailable', async () => {
    expect(await searchAddress('paris', { fetchFn: fakeFetch(500, {}) })).toEqual({
      ok: false,
      error: 'unavailable',
    });
  });

  it('un fetch qui rejette donne network', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('aborted'));
    expect(await searchAddress('paris', { fetchFn })).toEqual({
      ok: false,
      error: 'network',
    });
  });

  it('ignore un résultat sans coordonnées numériques', async () => {
    const base = { name: 'Rue Pasteur', city: 'Wasquehal', postcode: '59290' };
    const body = {
      features: [
        { properties: base, geometry: { coordinates: [] } },
        { properties: { ...base, name: 'Rue Carnot' }, geometry: { coordinates: ['a', 'b'] } },
        { properties: { ...base, name: 'Rue Gambetta' }, geometry: { coordinates: [3.12, 50.67] } },
      ],
    };
    expect(await searchAddress('wasquehal', { fetchFn: fakeFetch(200, body) })).toEqual({
      ok: true,
      hits: [
        {
          label: 'Rue Gambetta, Wasquehal',
          name: 'Rue Gambetta',
          place: '59290 Wasquehal',
          latitude: 50.67,
          longitude: 3.12,
        },
      ],
    });
  });

  it("un 200 qui n'est pas du JSON donne unavailable", async () => {
    const fetchFn = jest.fn(async () => ({ status: 200, json: () => Promise.reject(new SyntaxError()) }) as Response);
    expect(await searchAddress('paris', { fetchFn })).toEqual({ ok: false, error: 'unavailable' });
  });
});
