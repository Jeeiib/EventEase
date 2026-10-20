// Recherche d'adresses et de lieux nommés via la Géoplateforme (API publique de l'IGN, sans clé).
export type AddressHit = {
  label: string;
  name: string;
  place: string;
  latitude: number;
  longitude: number;
};

export type AddressResult = { ok: true; hits: AddressHit[] } | { ok: false; error: 'network' | 'unavailable' };

export type SearchOptions = {
  near?: { latitude: number; longitude: number };
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
};

const MIN_QUERY_LENGTH = 3;

// Les adresses ont des champs texte, les lieux (poi) des tableaux : on prend la première chaîne des deux.
function firstText(value: unknown): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}

export async function searchAddress(query: string, options: SearchOptions = {}): Promise<AddressResult> {
  const { near, fetchFn = fetch, signal } = options;
  const q = query.trim();
  // En dessous de trois caractères la recherche est trop large : on économise l'appel.
  if (q.length < MIN_QUERY_LENGTH) return { ok: true, hits: [] };

  // Sans `index=address,poi` les lieux (lacs, parcs) sont introuvables ; lat/lon font passer le voisinage en premier.
  let url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&autocomplete=1&limit=5&index=address,poi`;
  if (near) url += `&lat=${near.latitude}&lon=${near.longitude}`;
  try {
    const res = await fetchFn(url, { signal });
    if (res.status !== 200) return { ok: false, error: 'unavailable' };
    const json = await res.json().catch(() => null);
    if (!Array.isArray(json?.features)) return { ok: false, error: 'unavailable' };
    const hits: AddressHit[] = [];
    const seen = new Set<string>();
    for (const f of json.features) {
      const coords = f?.geometry?.coordinates;
      const props = f?.properties;
      const name = firstText(props?.toponym) ?? firstText(props?.name);
      const city = firstText(props?.city);
      if (!name || !city || typeof coords?.[0] !== 'number' || typeof coords?.[1] !== 'number') continue;
      const label = `${name}, ${city}`;
      // L'API renvoie parfois deux fois le même lieu.
      if (seen.has(label)) continue;
      seen.add(label);
      const postcode = firstText(props?.postcode);
      // GeoJSON range la longitude avant la latitude.
      hits.push({
        label,
        name,
        place: postcode ? `${postcode} ${city}` : city,
        latitude: coords[1],
        longitude: coords[0],
      });
    }
    return { ok: true, hits };
  } catch {
    // Un abandon demandé par l'appelant (nouvelle frappe) se traite comme un échec réseau.
    return { ok: false, error: 'network' };
  }
}
