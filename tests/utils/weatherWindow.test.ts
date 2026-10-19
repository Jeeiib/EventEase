// Fenêtre de prévision : aujourd'hui à J+15 inclus.
import { weatherAvailability } from '@/utils/weatherWindow';

const now = new Date(2026, 9, 19, 12);

test('trop loin : disponible à partir de la date moins 15 jours', () => {
  expect(weatherAvailability('2026-11-13T13:00:00.000Z', now)).toEqual({
    kind: 'tooFar',
    availableFrom: new Date(2026, 9, 29),
  });
});

test('dans la fenêtre, J+15 inclus', () => {
  expect(weatherAvailability('2026-10-24T08:00:00.000Z', now)).toEqual({ kind: 'available', dayKey: '2026-10-24' });
  expect(weatherAvailability('2026-11-03T08:00:00.000Z', now).kind).toBe('available');
  expect(weatherAvailability('2026-11-04T08:00:00.000Z', now).kind).toBe('tooFar');
});

test('passé, y compris aujourd’hui à une heure révolue', () => {
  expect(weatherAvailability('2026-10-17T08:00:00.000Z', now)).toEqual({ kind: 'past' });
  expect(weatherAvailability('2026-10-19T08:00:00.000Z', now)).toEqual({ kind: 'past' });
  expect(weatherAvailability('2026-10-19T16:00:00.000Z', now).kind).toBe('available');
});
