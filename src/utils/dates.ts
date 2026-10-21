// Seul module qui calcule et formate des dates (Intl, locale d'i18n), en heure locale.
import { t } from 'i18next';
import { getAppLocale } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

// La langue des libellés suit la locale demandée, pas la langue globale d'i18next.
const languageOf = (locale: string) => locale.split('-')[0];

// En français, le premier du mois s'écrit « 1er » ; Intl donne « 1 ».
function withFirst(text: string, d: Date, locale: string): string {
  return d.getDate() === 1 && languageOf(locale) === 'fr'
    ? text.replace(/(^|\s)1(?=\s|$)/, (_, before: string) => `${before}1er`)
    : text;
}

/** Pas des heures proposées pour un événement : 5 minutes. */
export const STEP_MS = 5 * 60 * 1000;

/** Clé « AAAA-MM-JJ » du jour local de `d` ; clé de regroupement et de comparaison entre jours. */
export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Jour à sélectionner quand le calendrier affiche ce mois : aujourd'hui s'il en fait partie, sinon le 1er.
export function defaultDayKeyForMonth(month: Date, now: Date): string {
  const sameMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  return toDayKey(sameMonth ? now : new Date(month.getFullYear(), month.getMonth(), 1));
}

/** Minuit local du jour désigné par la clé (et non minuit UTC). */
export function fromDayKey(key: string): Date {
  const [y = 0, m = 1, day = 1] = key.split('-').map(Number);
  return new Date(y, m - 1, day);
}

/** Ajoute `n` jours calendaires en gardant l'heure ; ajouter 24 h fausserait les jours de changement d'heure. */
export function addDays(d: Date, n: number): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + n,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds(),
  );
}

/** Minuit du lundi de la semaine de `d` (la semaine commence le lundi). */
export function startOfWeek(d: Date): Date {
  const sinceMonday = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - sinceMonday);
}

export function isUpcoming(startsAtIso: string, now: Date): boolean {
  return new Date(startsAtIso) > now;
}

/** Heure au format « 9h30 », sur 24 h, via le gabarit i18n `time.hm`. */
export function formatTime(d: Date, locale: string = getAppLocale()): string {
  const parts = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(
    d,
  );
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return t('time.hm', { h: Number(hour), m: minute, lng: languageOf(locale) });
}

export function formatWeekdayShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
}

/** « sam. 24 » : date compacte sur une ligne, quand la colonne date passe au-dessus du texte. */
export function formatWeekdayDayShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(d);
}

/** « 24 oct. » : même usage, pour les listes sans en-têtes de mois. */
export function formatDayMonthShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d);
}

/** « oct. » : mois abrégé, sous le numéro du jour quand la liste n'a pas d'en-têtes de mois. */
export function formatMonthShort(d: Date, locale: string = getAppLocale()): string {
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
}

/** « samedi 24 » : jour de la semaine et numéro, pour une phrase (« samedi 1er » le premier du mois). */
export function formatWeekdayDay(d: Date, locale: string = getAppLocale()): string {
  return withFirst(new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric' }).format(d), d, locale);
}

/** « Samedi 31 octobre » ; l'année s'ajoute si elle diffère de celle de `now`. */
export function formatDayLong(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  const text = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  }).format(d);
  return capitalize(withFirst(text, d, locale), locale);
}

/** « Samedi 31 octobre, 9h30 » : jour long et heure. */
export function formatDayWithTime(d: Date, now: Date, locale: string = getAppLocale()): string {
  return t('time.dayAt', { day: formatDayLong(d, now, locale), time: formatTime(d, locale), lng: languageOf(locale) });
}

/** Mois seul (« Octobre ») ; l'année s'ajoute si elle diffère de celle de `now`. */
export function formatMonthHeader(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  const text = new Intl.DateTimeFormat(locale, { month: 'long', ...(withYear && { year: 'numeric' }) }).format(d);
  return capitalize(text, locale);
}

export function formatMonthYear(d: Date, locale: string = getAppLocale()): string {
  return capitalize(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d), locale);
}

/** « 31 octobre » ; l'année s'ajoute si elle diffère de celle de `now`. */
export function formatDateOnly(d: Date, now: Date, locale: string = getAppLocale()): string {
  const withYear = d.getFullYear() !== now.getFullYear();
  const text = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  }).format(d);
  return withFirst(text, d, locale);
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

/** Libellés pour react-native-calendars : douze mois, ou sept jours en commençant par le dimanche (attendu par la bibliothèque). */
export const monthNames = (locale: string = getAppLocale()) => monthLabels('long', locale);
export const monthNamesShort = (locale: string = getAppLocale()) => monthLabels('short', locale);
export const dayNames = (locale: string = getAppLocale()) => weekdayLabels('long', locale);
export const dayNamesShort = (locale: string = getAppLocale()) => weekdayLabels('short', locale);
