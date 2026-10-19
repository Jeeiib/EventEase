// Tri, regroupement par jour et par mois, marqueurs du calendrier.
import type { EventWithStatus } from '@/data/types';
import {
  buildListSections,
  dayMarkers,
  selectVisible,
  splitByTime,
  weekDays,
} from '@/utils/eventGroups';
import { toDayKey } from '@/utils/dates';

const now = new Date('2026-10-19T12:00:00.000Z');

let nextId = 1;
function make(startsAt: string, over: Partial<EventWithStatus> = {}): EventWithStatus {
  const id = nextId++;
  return {
    id,
    title: `Événement ${id}`,
    description: 'd',
    startsAt,
    location: null,
    authorId: 1,
    authorName: 'Marie',
    createdAt: startsAt,
    updatedAt: startsAt,
    participantCount: 0,
    isParticipating: false,
    ...over,
  };
}

const a = make('2026-10-24T08:00:00.000Z');
const b = make('2026-10-24T14:00:00.000Z');
const c = make('2026-10-30T09:00:00.000Z');
const d = make('2026-11-05T09:00:00.000Z');

test('splitByTime : à venir croissant, passé décroissant', () => {
  const old1 = make('2026-10-10T09:00:00.000Z');
  const old2 = make('2026-10-15T09:00:00.000Z');
  const todayPast = make('2026-10-19T08:00:00.000Z');
  const { upcoming, past } = splitByTime([d, old1, b, a, old2, todayPast], now);
  expect(upcoming.map((e) => e.id)).toEqual([a.id, b.id, d.id]);
  expect(past.map((e) => e.id)).toEqual([todayPast.id, old2.id, old1.id]);
});

test('selectVisible : onglet et filtre « mes événements »', () => {
  const mine = make('2026-10-26T09:00:00.000Z', { isParticipating: true });
  const minePast = make('2026-10-12T09:00:00.000Z', { isParticipating: true });
  const other = make('2026-10-12T10:00:00.000Z');
  const all = [a, mine, minePast, other];
  expect(selectVisible(all, { tab: 'upcoming', onlyMine: false }, now).map((e) => e.id)).toEqual([a.id, mine.id]);
  expect(selectVisible(all, { tab: 'upcoming', onlyMine: true }, now).map((e) => e.id)).toEqual([mine.id]);
  expect(selectVisible(all, { tab: 'past', onlyMine: false }, now).map((e) => e.id)).toEqual([other.id, minePast.id]);
  expect(selectVisible(all, { tab: 'past', onlyMine: true }, now).map((e) => e.id)).toEqual([minePast.id]);
});

const e = make('2026-10-27T09:00:00.000Z');

// L'entrée doit déjà être triée : buildListSections conserve l'ordre reçu.
test('buildListSections : 4 événements dont deux le même jour, un seul mois, 3 jours', () => {
  const sections = buildListSections([a, b, e, c]);
  expect(sections).toHaveLength(1);
  expect(sections[0]?.monthKey).toBe('2026-10');
  expect(sections[0]?.days.map((day) => day.dayKey)).toEqual(['2026-10-24', '2026-10-27', '2026-10-30']);
  expect(sections[0]?.days[0]?.events.map((e) => e.id)).toEqual([a.id, b.id]);
});

test('buildListSections : deux mois, trois jours', () => {
  const sections = buildListSections([a, b, c, d]);
  expect(sections.map((s) => s.monthKey)).toEqual(['2026-10', '2026-11']);
  expect(sections.flatMap((s) => s.days)).toHaveLength(3);
});

test('buildListSections : 23h30 à Paris reste dans son jour local', () => {
  const late = make('2026-10-24T21:30:00.000Z'); // 23h30 à Paris
  const after = make('2026-10-24T22:30:00.000Z'); // 00h30 le lendemain
  const sections = buildListSections([late, after]);
  expect(sections[0]?.days.map((day) => day.dayKey)).toEqual(['2026-10-24', '2026-10-25']);
  expect(sections[0]?.days[0]?.events[0]?.id).toBe(late.id);
});

test('buildListSections : liste vide', () => {
  expect(buildListSections([])).toEqual([]);
});

test('weekDays : du lundi au dimanche', () => {
  const days = weekDays(new Date(2026, 9, 22, 15));
  expect(days).toHaveLength(7);
  expect(days.map(toDayKey)).toEqual([
    '2026-10-19',
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
    '2026-10-24',
    '2026-10-25',
  ]);
});

test('dayMarkers : la participation prime sur l’événement', () => {
  const mine = make('2026-10-24T16:00:00.000Z', { isParticipating: true });
  expect(dayMarkers([a, b, c, mine])).toEqual({ '2026-10-24': 'participating', '2026-10-30': 'event' });
  expect(dayMarkers([mine, a])).toEqual({ '2026-10-24': 'participating' });
  expect(dayMarkers([])).toEqual({});
});
