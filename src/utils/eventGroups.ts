// Tri et regroupement des événements pour la liste, la semaine et le calendrier.
import type { EventWithStatus } from '@/data/types';
import { addDays, isUpcoming, startOfWeek, toDayKey } from '@/utils/dates';

export type DaySection = { dayKey: string; events: EventWithStatus[] };
export type MonthSection = { monthKey: string; days: DaySection[] };

const byStart = (a: EventWithStatus, b: EventWithStatus) => Date.parse(a.startsAt) - Date.parse(b.startsAt);

/** À venir (le plus proche d'abord) et passés (le plus récent d'abord). */
export function splitByTime(events: EventWithStatus[], now: Date) {
  const upcoming = events.filter((e) => isUpcoming(e.startsAt, now)).sort(byStart);
  const past = events.filter((e) => !isUpcoming(e.startsAt, now)).sort((a, b) => byStart(b, a));
  return { upcoming, past };
}

/** Ce que compte chaque ligne du profil : les événements créés par `userId`, ou ceux où il participe. */
export function selectProfileEvents(
  events: EventWithStatus[],
  kind: 'created' | 'participations',
  userId: number,
): EventWithStatus[] {
  return events.filter((e) => (kind === 'created' ? e.authorId === userId : e.isParticipating));
}

/** Événements de l'onglet choisi, limités à ceux où l'on participe si `onlyMine`. */
export function selectVisible(
  events: EventWithStatus[],
  filter: { tab: 'upcoming' | 'past'; onlyMine: boolean },
  now: Date,
): EventWithStatus[] {
  const list = splitByTime(events, now)[filter.tab];
  return filter.onlyMine ? list.filter((e) => e.isParticipating) : list;
}

/** Regroupe par mois puis par jour, dans l'ordre reçu : l'entrée doit déjà être triée. */
export function buildListSections(events: EventWithStatus[]): MonthSection[] {
  const months: MonthSection[] = [];
  for (const event of events) {
    const dayKey = toDayKey(new Date(event.startsAt));
    const monthKey = dayKey.slice(0, 7);
    let month = months.find((m) => m.monthKey === monthKey);
    if (!month) {
      month = { monthKey, days: [] };
      months.push(month);
    }
    let day = month.days.find((d) => d.dayKey === dayKey);
    if (!day) {
      day = { dayKey, events: [] };
      month.days.push(day);
    }
    day.events.push(event);
  }
  return months;
}

/** Les sept jours de la semaine de `now`, du lundi au dimanche. */
export function weekDays(now: Date): Date[] {
  const monday = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Marqueur par clé de jour : `participating` (point plein) l'emporte sur `event` (anneau). */
export function dayMarkers(events: EventWithStatus[]): Record<string, 'event' | 'participating'> {
  const markers: Record<string, 'event' | 'participating'> = {};
  for (const event of events) {
    const key = toDayKey(new Date(event.startsAt));
    if (event.isParticipating) markers[key] = 'participating';
    else markers[key] ??= 'event';
  }
  return markers;
}

/** Événements de la semaine `week`, triés par début. */
export function eventsInWeek(events: EventWithStatus[], week: Date[]): EventWithStatus[] {
  const days = new Set(week.map(toDayKey));
  return events.filter((e) => days.has(toDayKey(new Date(e.startsAt)))).sort(byStart);
}
