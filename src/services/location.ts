// Position de l'appareil pour calculer la distance aux événements.
import * as Location from 'expo-location';
import { Linking } from 'react-native';

type Coords = { latitude: number; longitude: number };

export type PositionResult = { status: 'granted'; coords: Coords } | { status: 'denied'; canAskAgain: boolean };

export async function getPositionForDistance(onCoarse?: (coords: Coords) => void): Promise<PositionResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return { status: 'denied', canAskAgain: permission.canAskAgain };

  // La dernière position connue est instantanée : l'écran peut afficher une distance en attendant le GPS.
  let lastKnown: Coords | null = null;
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      lastKnown = {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
      };
      onCoarse?.(lastKnown);
    }
  } catch {
    // Pas bloquant : on passe directement à la position précise.
  }

  try {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      status: 'granted',
      coords: {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      },
    };
  } catch (error) {
    if (lastKnown) return { status: 'granted', coords: lastKnown };
    throw error;
  }
}

export function openLocationSettings(): Promise<void> {
  return Linking.openSettings();
}
