// Ligne d'événement de la liste : toute la ligne est la cible, lue d'un seul bloc par VoiceOver.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EventWithStatus } from '@/data/types';
import { joinA11y } from '@/i18n/a11y';
import { colors, font, size } from '@/theme/tokens';
import { formatDayLong, formatTime, formatWeekdayShort } from '@/utils/dates';

type Props = {
  event: EventWithStatus;
  // Premier événement du jour : colonne date et filet au-dessus ; les suivants s'alignent dessous.
  firstOfDay: boolean;
  past: boolean;
  now: Date;
  onPress: () => void;
};

export function EventRow({ event, firstOfDay, past, now, onPress }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const start = new Date(event.startsAt);
  const time = formatTime(start);
  const status = event.isParticipating ? (past ? t('list.participated') : t('list.participating')) : null;
  const label = joinA11y([
    event.title,
    t('list.row.when', { day: formatDayLong(start, now).toLocaleLowerCase(), time }),
    event.location?.label,
    event.isParticipating && (past ? t('list.row.participated') : t('list.row.participating')),
  ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, firstOfDay ? styles.first : styles.sub, pressed && styles.pressed]}
    >
      <View style={styles.date} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {firstOfDay && (
          <>
            <Text style={styles.dayNumber}>{start.getDate()}</Text>
            <Text style={styles.weekday}>{formatWeekdayShort(start)}</Text>
          </>
        )}
      </View>
      <View style={styles.body} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {status && (
          <View style={styles.status}>
            <Feather name="check" size={14} color={colors.success} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>
          {event.location ? t('list.row.meta', { time, place: event.location.label }) : time}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, minHeight: size.touch, paddingBottom: 12 },
  first: { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  sub: { paddingTop: 4 },
  pressed: { opacity: 0.6 },
  date: { width: size.dateColumn },
  dayNumber: {
    fontFamily: font.semiBold,
    fontSize: font.size.dayNumber,
    lineHeight: 32,
    letterSpacing: font.letterSpacing.dayNumber,
    color: colors.text,
  },
  weekday: { fontFamily: font.regular, fontSize: font.size.small, color: colors.muted, marginTop: 2 },
  body: { flex: 1, gap: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontFamily: font.medium, fontSize: font.size.small, color: colors.success },
  title: {
    fontFamily: font.semiBold,
    fontSize: font.size.title,
    lineHeight: 21,
    letterSpacing: font.letterSpacing.title,
    color: colors.text,
  },
  meta: { fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 19, color: colors.muted },
});
