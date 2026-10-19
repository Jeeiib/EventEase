// Distance jusqu'au lieu, à la demande. La permission n'est demandée qu'après l'explication, et la position
// n'est jamais enregistrée : elle reste en mémoire le temps de la session pour les fiches suivantes.
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { EventLocation } from '@/data/types';
import { getLocationPermission, getPositionForDistance } from '@/services/location';
import { distanceMeters } from '@/utils/distance';

type Coords = { latitude: number; longitude: number };

export type DistanceState =
  | { status: 'idle' }
  | { status: 'explaining' }
  | { status: 'locating' }
  | { status: 'ready'; meters: number }
  | { status: 'denied' }
  | { status: 'error' };

let sessionCoords: Coords | null = null;

// Le message de refus apparaît sous le bouton : VoiceOver ne le lirait pas sans annonce.
function announceDenied() {
  AccessibilityInfo.announceForAccessibility(t('event.distance.denied'));
}

export function useDistance(location: EventLocation | null) {
  const [state, setState] = useState<DistanceState>({ status: 'idle' });
  // Une réponse du GPS qui arrive après la fermeture de la fiche ne doit plus rien écrire.
  const alive = useRef(true);
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
        announceDenied();
      }
    } catch {
      // Une position approximative déjà affichée vaut mieux qu'un message d'erreur.
      if (alive.current && !sessionCoords) setState({ status: 'error' });
    }
  }, [location]);

  const request = useCallback(async () => {
    const permission = await getLocationPermission();
    if (!alive.current) return;
    if (permission === 'granted') void locate();
    else if (permission === 'undetermined') setState({ status: 'explaining' });
    else {
      setState({ status: 'denied' });
      announceDenied();
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
