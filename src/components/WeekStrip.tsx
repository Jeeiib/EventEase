// Bandeau de la semaine en cours : un seul bouton pour VoiceOver, qui résume la semaine et ouvre le calendrier.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EventWithStatus } from '@/data/types';
import { joinA11y } from '@/i18n/a11y';
import { colors, font, size } from '@/theme/tokens';
import { formatDateOnly, formatWeekdayDay, formatWeekdayShort, toDayKey } from '@/utils/dates';

type Props = {
  week: Date[];
  weekEvents: EventWithStatus[];
  markers: Record<string, 'event' | 'participating'>;
  now: Date;
  onPress: () => void;
};

export function WeekStrip({ week, weekEvents, markers, now, onPress }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const todayKey = toDayKey(now);
  const label = t('list.weekStrip.label', {
    period: periodLabel(week, now, t),
    summary: summaryLabel(weekEvents, t),
  });

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('list.weekStrip.hint')}
      onPress={onPress}
      style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
    >
      {week.map((day) => {
        const key = toDayKey(day);
        const marker = markers[key];
        return (
          <View key={key} style={styles.day}>
            <Text style={styles.weekday}>{formatWeekdayShort(day)}</Text>
            <View style={[styles.number, key === todayKey && styles.today]}>
              <Text style={[styles.numberText, key === todayKey && styles.todayText]}>{day.getDate()}</Text>
            </View>
            <View style={[styles.dot, marker === 'event' && styles.dotEvent, marker === 'participating' && styles.dotMine]} />
          </View>
        );
      })}
    </Pressable>
  );
}

type T = ReturnType<typeof useTranslation>['t'];

// « du 19 au 25 octobre », ou « du 26 octobre au 1 novembre » quand la semaine change de mois.
function periodLabel(week: Date[], now: Date, t: T): string {
  const first = week[0];
  const last = week[week.length - 1];
  const sameMonth = first.getMonth() === last.getMonth();
  return t('list.weekStrip.period', {
    from: sameMonth ? String(first.getDate()) : formatDateOnly(first, now),
    to: formatDateOnly(last, now),
  });
}

function summaryLabel(events: EventWithStatus[], t: T): string {
  const day = events.length === 1 ? formatWeekdayDay(new Date(events[0].startsAt)) : '';
  const count = events.length === 0 ? t('list.weekStrip.none') : t('list.weekStrip.event', { count: events.length, day });
  return joinA11y([count, events.some((e) => e.isParticipating) && t('list.weekStrip.youParticipate')]);
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginHorizontal: 13,
    marginBottom: 2,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pressed: { opacity: 0.6 },
  day: { minWidth: size.weekDay, alignItems: 'center', gap: 5 },
  weekday: { fontFamily: font.regular, fontSize: font.size.weekday, color: colors.muted },
  number: {
    minWidth: size.dayCircle,
    minHeight: size.dayCircle,
    borderRadius: size.dayCircle / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Aujourd'hui est cerclé : le fond plein est réservé au jour sélectionné du calendrier.
  today: { borderWidth: 1.5, borderColor: colors.text },
  numberText: { fontFamily: font.medium, fontSize: font.size.title, color: colors.text },
  todayText: { fontFamily: font.semiBold },
  dot: { width: size.dot, height: size.dot, borderRadius: size.dot / 2 },
  dotEvent: { borderWidth: 1.5, borderColor: colors.text },
  dotMine: { backgroundColor: colors.success },
});
