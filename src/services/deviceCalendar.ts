// Ajout d'un événement au calendrier du téléphone, par la feuille native « Nouvel événement ».
// SDK 57 : l'import par défaut est la nouvelle API, absente d'Expo Go ; la version « legacy » marche partout.
import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';

/** `saved` : enregistré (iOS seulement) ; `closed` : feuille fermée, enregistrement incertain ; `denied` : accès refusé (iOS 16). */
export type DeviceCalendarResult = 'saved' | 'closed' | 'denied';

// Sans durée connue, une heure, comme la valeur par défaut d'iOS ; la feuille permet de la changer.
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

// iOS 17 et Android enregistrent eux-mêmes depuis leur feuille : aucune permission à demander.
// iOS 16 exige l'accès au calendrier avant d'ouvrir la feuille : on le demande à ce moment-là, jamais avant.
function needsPermission(): boolean {
  return Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) < 17;
}

/** Ouvre la feuille native « Nouvel événement », préremplie ; l'événement dure une heure par défaut, modifiable dans la feuille. */
export async function addToDeviceCalendar(event: {
  title: string;
  startsAt: string;
  description: string;
  location: string | null;
}): Promise<DeviceCalendarResult> {
  if (needsPermission()) {
    const { granted } = await Calendar.requestCalendarPermissionsAsync();
    if (!granted) return 'denied';
  }
  const start = new Date(event.startsAt);
  const result = await Calendar.createEventInCalendarAsync({
    title: event.title,
    startDate: start,
    endDate: new Date(start.getTime() + DEFAULT_DURATION_MS),
    location: event.location ?? undefined,
    notes: event.description,
  });
  // Android ne dit pas si l'événement a été enregistré : seule la réponse « saved » d'iOS le garantit.
  return result.action === 'saved' ? 'saved' : 'closed';
}
