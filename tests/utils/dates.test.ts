// Formatage et calcul de dates en heure de Paris, en français.
import '@/i18n';
import {
  addDays,
  dayNames,
  dayNamesShort,
  formatDateOnly,
  formatDayLong,
  formatDayWithTime,
  formatMonthHeader,
  formatMonthYear,
  formatTime,
  formatWeekdayShort,
  fromDayKey,
  isUpcoming,
  monthNames,
  monthNamesShort,
  startOfWeek,
  toDayKey,
} from '@/utils/dates';

const now = new Date(2026, 9, 19);

test('le fuseau de test est Paris', () => {
  expect(new Date('2026-10-24T22:30:00.000Z').getHours()).toBe(0);
});

test('toDayKey suit l’heure locale', () => {
  expect(toDayKey(new Date('2026-10-24T22:30:00.000Z'))).toBe('2026-10-25');
  expect(toDayKey(new Date('2026-10-24T21:30:00.000Z'))).toBe('2026-10-24');
  expect(toDayKey(new Date(2026, 9, 24, 23, 30))).toBe('2026-10-24');
});

test('fromDayKey rend minuit local et reboucle avec toDayKey', () => {
  expect(fromDayKey('2026-10-24')).toEqual(new Date(2026, 9, 24));
  expect(toDayKey(fromDayKey('2027-01-09'))).toBe('2027-01-09');
});

test('addDays traverse le changement d’heure sans décaler le jour', () => {
  expect(addDays(new Date(2026, 9, 19), 10)).toEqual(new Date(2026, 9, 29));
  expect(addDays(new Date(2026, 9, 19), 7)).toEqual(new Date(2026, 9, 26));
  expect(addDays(new Date(2026, 9, 19, 12), -1)).toEqual(new Date(2026, 9, 18, 12));
});

test('startOfWeek rend le lundi à minuit', () => {
  expect(startOfWeek(new Date(2026, 9, 22, 15))).toEqual(new Date(2026, 9, 19));
  expect(startOfWeek(new Date(2026, 9, 25, 23))).toEqual(new Date(2026, 9, 19));
  expect(startOfWeek(new Date(2026, 9, 19))).toEqual(new Date(2026, 9, 19));
});

test('isUpcoming compare à l’heure près', () => {
  expect(isUpcoming('2026-10-19T10:00:00.000Z', new Date('2026-10-19T12:00:00.000Z'))).toBe(false);
  expect(isUpcoming('2026-10-19T14:00:00.000Z', new Date('2026-10-19T12:00:00.000Z'))).toBe(true);
  expect(isUpcoming('2026-10-19T12:00:00.000Z', new Date('2026-10-19T12:00:00.000Z'))).toBe(false);
});

test('formatTime', () => {
  expect(formatTime(new Date(2026, 9, 24, 9, 30))).toBe('9h30');
  expect(formatTime(new Date(2026, 9, 24, 19, 0))).toBe('19h00');
  expect(formatTime(new Date(2026, 9, 24, 0, 5))).toBe('0h05');
});

test('formatWeekdayShort', () => {
  expect(formatWeekdayShort(new Date(2026, 9, 24))).toBe('sam.');
});

test('formatDayLong ajoute l’année quand elle diffère', () => {
  expect(formatDayLong(new Date(2026, 9, 24), now)).toBe('Samedi 24 octobre');
  expect(formatDayLong(new Date(2027, 0, 9), now)).toBe('Samedi 9 janvier 2027');
});

test('formatDayWithTime', () => {
  expect(formatDayWithTime(new Date(2026, 9, 31, 9, 30), now)).toBe('Samedi 31 octobre, 9h30');
  expect(formatDayWithTime(new Date(2027, 0, 9, 19, 0), now)).toBe('Samedi 9 janvier 2027, 19h00');
});

test('formatMonthHeader', () => {
  expect(formatMonthHeader(new Date(2026, 9, 1), now)).toBe('Octobre');
  expect(formatMonthHeader(new Date(2026, 10, 1), now)).toBe('Novembre');
  expect(formatMonthHeader(new Date(2027, 0, 1), now)).toBe('Janvier 2027');
});

test('formatMonthYear', () => {
  expect(formatMonthYear(new Date(2026, 9, 5))).toBe('Octobre 2026');
});

test('formatDateOnly', () => {
  expect(formatDateOnly(new Date(2026, 9, 29), now)).toBe('29 octobre');
  expect(formatDateOnly(new Date(2027, 0, 9), now)).toBe('9 janvier 2027');
});

test('noms de mois et de jours, dimanche en premier', () => {
  expect(monthNames()).toHaveLength(12);
  expect(monthNames()[0]).toBe('janvier');
  expect(monthNames()[11]).toBe('décembre');
  expect(monthNamesShort()[0]).toBe('janv.');
  expect(dayNames()[0]).toBe('dimanche');
  expect(dayNames()).toHaveLength(7);
  expect(dayNamesShort()[0]).toBe('dim.');
  expect(dayNamesShort()[6]).toBe('sam.');
});
