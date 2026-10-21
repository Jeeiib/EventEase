// Données de la fiche d'un événement et actions de l'utilisateur (participer, supprimer).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { eventsRepo } from '@/data/events';
import { participationsRepo } from '@/data/participations';
import type { EventWithStatus } from '@/data/types';
import { useDb } from '@/db/DbContext';

type Loaded = { eventId: number; event: EventWithStatus | null };

export function useEventDetail(eventId: number) {
  const db = useDb();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Le résultat porte l'id demandé : un autre eventId repasse en « loading » sans setState dans un effet.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const latest = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (userId === null) return;
    const ticket = ++latest.current;
    const event = await eventsRepo.getById(db, eventId, userId);
    if (mounted.current && ticket === latest.current) setLoaded({ eventId, event });
  }, [db, eventId, userId]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
      return () => {
        latest.current++;
      };
    }, [refresh]),
  );

  const current = loaded?.eventId === eventId ? loaded : null;
  const event = current?.event ?? null;
  const status: 'loading' | 'ready' | 'missing' = !current ? 'loading' : event ? 'ready' : 'missing';
  const isAuthor = event !== null && userId !== null && event.authorId === userId;

  const toggleParticipation = useCallback(async () => {
    if (userId === null) throw new Error('Aucun utilisateur connecté');
    const result = await participationsRepo.toggle(db, userId, eventId, new Date().toISOString());
    // Invalide une relecture encore en vol : elle réécrirait l'ancien statut.
    latest.current++;
    // Met la fiche à jour tout de suite, sans attendre une relecture complète.
    if (mounted.current) {
      setLoaded((prev) =>
        prev && prev.eventId === eventId && prev.event ? { eventId, event: { ...prev.event, ...result } } : prev,
      );
    }
    return result;
  }, [db, userId, eventId]);

  const remove = useCallback(async () => {
    if (userId === null) throw new Error('Aucun utilisateur connecté');
    const removed = await eventsRepo.remove(db, eventId, userId);
    if (!removed)
      throw new Error("Suppression refusée : l'événement n'existe plus ou n'appartient pas à l'utilisateur");
  }, [db, userId, eventId]);

  return { event, status, isAuthor, toggleParticipation, remove, refresh };
}
