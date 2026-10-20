// Ligne d'événement de la liste : toute la ligne est la cible, lue d'un seul bloc par VoiceOver.
import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EventWithStatus } from '@/data/types';
import { getAppLocale } from '@/i18n';
import { joinA11y } from '@/i18n/a11y';
import { colors, font, size } from '@/theme/tokens';
import { formatDayLong, formatMonthShort, formatTime, formatWeekdayShort } from '@/utils/dates';

type Props = {
  event: EventWithStatus;
  // Premier événement du jour : colonne date et filet au-dessus ; les suivants s'alignent dessous.
  firstOfDay: boolean;
  past: boolean;
  now: Date;
  // Reçoit l'identifiant : la liste passe une seule fonction stable à toutes ses lignes.
  onOpen: (eventId: number) => void;
  // Liste sans en-têtes de mois (profil) : le mois passe sous le numéro, le jour de la semaine dans la ligne.
  withMonth?: boolean;
  showStatus?: boolean;
};

export const EventRow = memo(function EventRow({
  event,
  firstOfDay,
  past,
  now,
  onOpen,
  withMonth = false,
  showStatus = true,
}: Props) {
  const { t } = useTranslation();
  const start = new Date(event.startsAt);
  const time = formatTime(start);
  const status = showStatus && event.isParticipating ? (past ? t('list.participated') : t('list.participating')) : null;
  const timeAndPlace = event.location ? t('list.row.meta', { time, place: event.location.label }) : time;
  // Dans le profil, les événements passés côtoient les autres : on les estompe.
  const dim = withMonth && past;
  const label = joinA11y([
    event.title,
    t('list.row.when', { day: formatDayLong(start, now).toLocaleLowerCase(getAppLocale()), time }),
    event.location?.label,
    showStatus && event.isParticipating && (past ? t('list.row.participated') : t('list.row.participating')),
  ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onOpen(event.id)}
      style={({ pressed }) => [styles.row, firstOfDay ? styles.first : styles.sub, pressed && styles.pressed]}
    >
      <View style={styles.date} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {firstOfDay && (
          <>
            <Text style={[styles.dayNumber, dim && styles.dim]}>{start.getDate()}</Text>
            <Text style={styles.weekday}>{withMonth ? formatMonthShort(start) : formatWeekdayShort(start)}</Text>
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
        <Text style={[styles.title, dim && styles.dim]}>{event.title}</Text>
        <Text style={styles.meta}>
          {withMonth
            ? t('profile.list.row.meta', { weekday: formatWeekdayShort(start), rest: timeAndPlace })
            : timeAndPlace}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, minHeight: size.touch, paddingBottom: 12 },
  first: { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  sub: { paddingTop: 4 },
  pressed: { opacity: 0.6 },
  date: { minWidth: size.dateColumn },
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
  dim: { color: colors.muted },
});
