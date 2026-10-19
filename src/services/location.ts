// Position de l'appareil pour calculer la distance aux événements.
import * as Location from 'expo-location';
import { Linking } from 'react-native';

export type Coords = { latitude: number; longitude: number };

export type PositionResult = { status: 'granted'; coords: Coords } | { status: 'denied'; canAskAgain: boolean };

/** État de la permission de position, sans rien demander : la fiche décide s'il faut d'abord expliquer. */
export async function getLocationPermission(): Promise<'granted' | 'undetermined' | 'denied'> {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  // Une demande reste possible tant que le système n'a pas enregistré de refus définitif.
  return status === 'undetermined' || canAskAgain ? 'undetermined' : 'denied';
}

// En intérieur, le GPS peut ne jamais répondre : au-delà, on se contente de la dernière position connue.
const POSITION_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Demande la permission, puis lit la position de l'appareil.
 * `onCoarse` reçoit tout de suite la dernière position connue, pour afficher une distance avant la fin du GPS.
 * Si le GPS ne répond pas dans le délai, la dernière position connue sert de résultat ; sans elle, l'erreur est relancée.
 */
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
    const current = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      POSITION_TIMEOUT_MS,
    );
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

/** Ouvre les réglages de l'app, seul endroit où réactiver une permission refusée définitivement. */
export function openLocationSettings(): Promise<void> {
  return Linking.openSettings();
}
