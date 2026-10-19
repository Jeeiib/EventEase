// Ouverture d'un lieu dans l'app de cartes du téléphone, celle que l'utilisateur a choisie par défaut.
import { Linking, Platform } from 'react-native';
import type { EventLocation } from '@/data/types';

export function mapsUrl(place: EventLocation, os: string = Platform.OS): string {
  const coords = `${place.latitude},${place.longitude}`;
  const label = encodeURIComponent(place.label);
  // iOS : Plans, ou l'app de navigation par défaut là où iOS laisse la choisir.
  // Android : l'intention geo:, que reçoit l'app de cartes par défaut, ou le sélecteur du système.
  return os === 'ios' ? `https://maps.apple.com/?ll=${coords}&q=${label}` : `geo:${coords}?q=${coords}(${label})`;
}

export async function openInMaps(place: EventLocation): Promise<void> {
  try {
    await Linking.openURL(mapsUrl(place));
  } catch {
    // Aucune app ne répond au lien natif : la carte web reste toujours disponible.
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`);
  }
}
