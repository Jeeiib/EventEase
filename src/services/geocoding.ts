// Recherche d'adresses via la Géoplateforme (API publique de l'IGN, sans clé).
export type AddressHit = { label: string; latitude: number; longitude: number };

export type AddressResult = { ok: true; hits: AddressHit[] } | { ok: false; error: 'network' | 'unavailable' };

const MIN_QUERY_LENGTH = 3;

export async function searchAddress(
  query: string,
  fetchFn: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<AddressResult> {
  const q = query.trim();
  // En dessous de trois caractères la recherche est trop large : on économise l'appel.
  if (q.length < MIN_QUERY_LENGTH) return { ok: true, hits: [] };

  const url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&autocomplete=1&limit=5`;
  try {
    const res = await fetchFn(url, { signal });
    if (res.status !== 200) return { ok: false, error: 'unavailable' };
    const json = await res.json().catch(() => null);
    if (!Array.isArray(json?.features)) return { ok: false, error: 'unavailable' };
    const hits: AddressHit[] = [];
    for (const f of json.features) {
      const coords = f?.geometry?.coordinates;
      const label = f?.properties?.label;
      if (typeof label !== 'string' || typeof coords?.[0] !== 'number' || typeof coords?.[1] !== 'number') continue;
      // GeoJSON range la longitude avant la latitude.
      hits.push({ label, latitude: coords[1], longitude: coords[0] });
    }
    return { ok: true, hits };
  } catch {
    // Un abandon demandé par l'appelant (nouvelle frappe) se traite comme un échec réseau.
    return { ok: false, error: 'network' };
  }
}
