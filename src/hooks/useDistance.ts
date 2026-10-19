// Distance jusqu'au lieu, à la demande. La permission n'est demandée qu'après l'explication, et la position
// n'est jamais enregistrée : elle reste en mémoire le temps de la session pour les fiches suivantes.
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { EventLocation } from '@/data/types';
import { getLocationPermission, getPositionForDistance, type Coords } from '@/services/location';
import { distanceMeters } from '@/utils/distance';

export type DistanceState =
  | { status: 'idle' }
  | { status: 'explaining' }
  | { status: 'locating' }
  | { status: 'ready'; meters: number }
  | { status: 'denied' }
  | { status: 'error' };

let sessionCoords: Coords | null = null;

// Le message de refus apparaît sous le bouton : VoiceOver ne le lirait pas sans annonce.
function announce(key: 'event.distance.denied' | 'event.distance.unavailable') {
  AccessibilityInfo.announceForAccessibility(t(key));
}

export function useDistance(location: EventLocation | null) {
  const [state, setState] = useState<DistanceState>({ status: 'idle' });
  // Une réponse du GPS qui arrive après la fermeture de la fiche ne doit plus rien écrire.
  const alive = useRef(true);
  // Un second toucher pendant la lecture de la permission ne relance pas tout.
  const pending = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const locate = useCallback(async () => {
    if (!location) return;
    setState({ status: 'locating' });
    const show = (coords: Coords) => {
      sessionCoords = coords;
      if (alive.current) setState({ status: 'ready', meters: distanceMeters(coords, location) });
    };
    try {
      const result = await getPositionForDistance(show);
      if (result.status === 'granted') show(result.coords);
      else if (alive.current) {
        setState({ status: 'denied' });
        announce('event.distance.denied');
      }
    } catch {
      // Une position approximative déjà affichée vaut mieux qu'un message d'erreur.
      if (alive.current && !sessionCoords) {
        setState({ status: 'error' });
        announce('event.distance.unavailable');
      }
    }
  }, [location]);

  const request = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    let permission: Awaited<ReturnType<typeof getLocationPermission>>;
    try {
      permission = await getLocationPermission();
    } catch {
      if (alive.current) {
        setState({ status: 'error' });
        announce('event.distance.unavailable');
      }
      return;
    } finally {
      pending.current = false;
    }
    if (!alive.current) return;
    if (permission === 'granted') void locate();
    else if (permission === 'undetermined') setState({ status: 'explaining' });
    else {
      setState({ status: 'denied' });
      announce('event.distance.denied');
    }
  }, [locate]);

  const dismiss = useCallback(() => setState({ status: 'idle' }), []);

  // Position déjà connue dans la session : la distance s'affiche d'office, dès que le lieu est chargé.
  const distance: DistanceState =
    state.status === 'idle' && location && sessionCoords
      ? { status: 'ready', meters: distanceMeters(sessionCoords, location) }
      : state;

  return { distance, request, confirm: locate, dismiss };
}
