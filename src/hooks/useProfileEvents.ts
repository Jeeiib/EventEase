// Événements créés par l'utilisateur, ou ceux où il participe, relus à chaque focus et coupés à venir / passés.
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { eventsRepo } from '@/data/events';
import type { EventWithStatus } from '@/data/types';
import { useDb } from '@/db/DbContext';
import { selectProfileEvents, splitByTime } from '@/utils/eventGroups';

/** Événements créés par l'utilisateur ou ceux où il participe, à venir puis passés ; `loaded` passe à `true` après la première lecture. */
export function useProfileEvents(kind: 'created' | 'participations') {
  const db = useDb();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [snapshot, setSnapshot] = useState<{ events: EventWithStatus[]; now: Date } | null>(null);
  const latest = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (userId === null) return;
      const ticket = ++latest.current;
      eventsRepo
        .listAll(db, userId)
        .then((all) => {
          if (ticket !== latest.current) return;
          // Même lecture que la liste principale : les compteurs du profil et ces lignes ne peuvent pas diverger.
          setSnapshot({ events: selectProfileEvents(all, kind, userId), now: new Date() });
        })
        .catch(() => {});
      return () => {
        latest.current++;
      };
    }, [db, userId, kind]),
  );

  const split = useMemo(() => (snapshot ? splitByTime(snapshot.events, snapshot.now) : null), [snapshot]);
  return {
    loaded: snapshot !== null,
    now: snapshot?.now ?? null,
    upcoming: split?.upcoming ?? [],
    past: split?.past ?? [],
  };
}
