// Phrase lue par VoiceOver pour le bandeau de la semaine : la période, puis ce qui s'y passe.
import type { TFunction } from 'i18next';
import type { EventWithStatus } from '@/data/types';
import { joinA11y } from '@/i18n/a11y';
import { formatDateOnly, formatWeekdayDay } from './dates';

/** « du 19 au 25 octobre », ou « du 28 décembre au 3 janvier 2027 » quand la semaine change de mois. */
export function weekPeriodLabel(week: Date[], now: Date, t: TFunction): string {
  const first = week[0];
  const last = week[week.length - 1];
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  return t('list.weekStrip.period', {
    from: sameMonth ? String(first.getDate()) : formatDateOnly(first, now),
    to: formatDateOnly(last, now),
  });
}

/** Résumé de la semaine pour VoiceOver : nombre d'événements (le jour s'il n'y en a qu'un) et participation. */
export function weekSummaryLabel(events: EventWithStatus[], t: TFunction): string {
  const day = events.length === 1 ? formatWeekdayDay(new Date(events[0].startsAt)) : '';
  const count =
    events.length === 0 ? t('list.weekStrip.none') : t('list.weekStrip.event', { count: events.length, day });
  return joinA11y([count, events.some((e) => e.isParticipating) && t('list.weekStrip.youParticipate')]);
}

/** Phrase complète lue pour le bandeau de la semaine : période, puis résumé. */
export function weekStripLabel(week: Date[], events: EventWithStatus[], now: Date, t: TFunction): string {
  return t('list.weekStrip.label', { period: weekPeriodLabel(week, now, t), summary: weekSummaryLabel(events, t) });
}
