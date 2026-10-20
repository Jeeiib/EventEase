// Seul module qui calcule et formate des dates (Intl, locale d'i18n), en heure locale.
import { t } from 'i18next';
import { getAppLocale } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

// La langue des libellés suit la locale demandée, pas la langue globale d'i18next.
const languageOf = (locale: string) => locale.split('-')[0];

export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDayKey(key: string): Date {
  const [y = 0, m = 1, day = 1] = key.split('-').map(Number);
  return new Date(y, m - 1, day);
}

// Arithmétique sur le calendrier local : ajouter 24 h fausserait les jours de changement d'heure.
export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

export function startOfWeek(d: Date): Date {
  const sinceMonday = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - sinceMonday);
}

export function isUpcoming(startsAtIso: string, now: Date): boolean {
  return new Date(startsAtIso) > now;
}

export function formatTime(d: Date, locale: string = getAppLocale()): string {
  const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return t('time.hm', { h: Number(hour), m: minute, lng: languageOf(locale) });
}

export function formatWeekdayShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
}

// « oct. » : mois abrégé, sous le numéro du jour quand la liste n'a pas d'en-têtes de mois.
export function formatMonthShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
}

// « samedi 24 » : jour de la semaine et numéro, pour une phrase.
export function formatWeekdayDay(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric' }).format(d);
}

export function formatDayLong(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  const text = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  }).format(d);
  return capitalize(text, locale);
}

export function formatDayWithTime(d: Date, now: Date, locale: string = getAppLocale()): string {
  return t('time.dayAt', { day: formatDayLong(d, now, locale), time: formatTime(d, locale), lng: languageOf(locale) });
}

export function formatMonthHeader(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  const text = new Intl.DateTimeFormat(locale, { month: 'long', ...(withYear && { year: 'numeric' }) }).format(d);
  return capitalize(text, locale);
}

export function formatMonthYear(d: Date, locale: string = getAppLocale()): string {
  return capitalize(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d), locale);
}

export function formatDateOnly(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', ...(withYear && { year: 'numeric' }) }).format(d);
}

function monthLabels(month: 'long' | 'short', locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month });
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2026, i, 1)));
}

function weekdayLabels(weekday: 'long' | 'short', locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday });
  // Le 18 octobre 2026 est un dimanche : react-native-calendars attend dimanche en premier.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 9, 18 + i)));
}

export const monthNames = (locale: string = getAppLocale()) => monthLabels('long', locale);
export const monthNamesShort = (locale: string = getAppLocale()) => monthLabels('short', locale);
export const dayNames = (locale: string = getAppLocale()) => weekdayLabels('long', locale);
export const dayNamesShort = (locale: string = getAppLocale()) => weekdayLabels('short', locale);
