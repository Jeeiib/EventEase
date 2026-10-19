// Libellé VoiceOver du bandeau de la semaine.
import { t } from 'i18next';
import '@/i18n';
import type { EventWithStatus } from '@/data/types';
import { weekDays } from '@/utils/eventGroups';
import { weekStripLabel } from '@/utils/weekLabel';

function event(start: Date, isParticipating = false): EventWithStatus {
  return {
    id: 1,
    title: 'Atelier',
    description: 'd',
    startsAt: start.toISOString(),
    location: null,
    authorId: 1,
    authorName: 'Marie',
    createdAt: start.toISOString(),
    updatedAt: start.toISOString(),
    participantCount: 0,
    isParticipating,
  };
}

const now = new Date(2026, 9, 19, 12);

test('une semaine dans un seul mois, un événement auquel je participe', () => {
  const week = weekDays(now);
  expect(weekStripLabel(week, [event(new Date(2026, 9, 24, 10), true)], now, t)).toBe(
    'Cette semaine, du 19 au 25 octobre : un événement samedi 24, tu participes',
  );
});

test('une semaine sans événement', () => {
  expect(weekStripLabel(weekDays(now), [], now, t)).toBe('Cette semaine, du 19 au 25 octobre : aucun événement');
});

test('plusieurs événements : le nombre seulement', () => {
  const events = [event(new Date(2026, 9, 20, 10)), event(new Date(2026, 9, 22, 10))];
  expect(weekStripLabel(weekDays(now), events, now, t)).toBe('Cette semaine, du 19 au 25 octobre : 2 événements');
});

test('une semaine à cheval sur deux années', () => {
  const newYear = new Date(2026, 11, 30, 12);
  expect(weekStripLabel(weekDays(newYear), [], newYear, t)).toBe(
    'Cette semaine, du 28 décembre au 3 janvier 2027 : aucun événement',
  );
});
