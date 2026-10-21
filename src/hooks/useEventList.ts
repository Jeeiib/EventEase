// Données de l'écran Liste et du calendrier : relues à chaque focus, filtrées par onglet.
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { eventsRepo } from '@/data/events';
import type { EventWithStatus } from '@/data/types';
import { useDb } from '@/db/DbContext';
import { buildListSections, dayMarkers, eventsInWeek, selectVisible, splitByTime, weekDays } from '@/utils/eventGroups';

export type EventListView = 'upcoming' | 'past';

export function useEventList() {
  const db = useDb();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [view, setView] = useState<EventListView>('upcoming');
  const [mineOnly, setMineOnly] = useState(false);
  // « maintenant » est figé à chaque lecture : le rendu reste pur et cohérent avec les données.
  const [snapshot, setSnapshot] = useState<{ events: EventWithStatus[]; now: Date }>(() => ({
    events: [],
    now: new Date(),
  }));

  // Seule la dernière lecture lancée a le droit d'écrire l'état.
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    if (userId === null) return;
    const ticket = ++latest.current;
    const events = await eventsRepo.listAll(db, userId);
    if (ticket === latest.current) setSnapshot({ events, now: new Date() });
  }, [db, userId]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
      return () => {
        // Un écran qui perd le focus invalide la lecture en vol.
        latest.current++;
      };
    }, [refresh]),
  );

  const { events, now } = snapshot;
  const sections = useMemo(
    () => buildListSections(selectVisible(events, { tab: view, onlyMine: mineOnly }, now)),
    [events, view, mineOnly, now],
  );
  const markers = useMemo(() => dayMarkers(events), [events]);
  const week = useMemo(() => weekDays(now), [now]);
  const weekEvents = useMemo(() => eventsInWeek(events, week), [events, week]);
  // Indépendant du filtre « mes participations » : sert à dire combien d'événements attendent l'utilisateur.
  const total = useMemo(() => splitByTime(events, now).upcoming.length, [events, now]);

  return { view, setView, mineOnly, setMineOnly, events, sections, markers, week, weekEvents, now, total };
}
