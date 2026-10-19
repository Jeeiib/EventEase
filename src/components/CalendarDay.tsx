// Cellule de jour du calendrier : numéro dans un cercle, point dessous (anneau = un événement,
// vert plein = tu participes). Aujourd'hui est cerclé, le jour choisi est plein.
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { joinA11y } from '@/i18n/a11y';
import { colors, font } from '@/theme/tokens';
import { formatDayLong, fromDayKey } from '@/utils/dates';

/** Ce que l'écran glisse dans markedDates pour chaque jour. */
export type DayMarking = {
  selected?: boolean;
  /** Posé par l'écran : la bibliothèque donne l'état « today » au jour affiché à l'ouverture, pas à aujourd'hui. */
  today?: boolean;
  marker?: 'event' | 'participating';
  count?: number;
  past?: boolean;
};

type Props = {
  date?: DateData;
  marking?: DayMarking;
  onPress?: (date?: DateData) => void;
};

// Plafond de la mise à l'échelle du texte des numéros (Dynamic Type).
const MAX_SCALE = 1.4;

export const CalendarDay = memo(function CalendarDay({ date, marking, onPress }: Props) {
  const { t } = useTranslation();
  if (!date) return <View style={styles.cell} />;
  const today = !!marking?.today;
  const selected = !!marking?.selected;
  const count = marking?.count ?? 0;
  // L'en-tête du mois porte déjà l'année : on la tait dans chaque cellule.
  const day = formatDayLong(fromDayKey(date.dateString), fromDayKey(date.dateString));
  const label = joinA11y([
    day,
    today && t('calendar.a11y.today'),
    selected && t('calendar.a11y.selected'),
    count > 0 ? t('calendar.a11y.events', { count }) : t('calendar.a11y.noEvent'),
    marking?.marker === 'participating' &&
      (marking.past ? t('calendar.a11y.participated') : t('calendar.a11y.participating')),
  ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={() => onPress?.(date)}
      style={({ pressed }) => [styles.cell, pressed && !selected && styles.pressed]}
    >
      <View style={[styles.circle, today && styles.today, selected && styles.selected]}>
        <Text
          style={[styles.number, selected && styles.selectedNumber]}
          maxFontSizeMultiplier={MAX_SCALE}
          importantForAccessibility="no"
        >
          {date.day}
        </Text>
      </View>
      <View
        style={[
          styles.dot,
          marking?.marker === 'event' && styles.ring,
          marking?.marker === 'participating' && styles.filled,
        ]}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: { minHeight: 48, minWidth: 44, alignItems: 'center', justifyContent: 'center', gap: 3 },
  pressed: { opacity: 0.6 },
  circle: { minWidth: 34, minHeight: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.text },
  selected: { backgroundColor: colors.text, borderColor: colors.text },
  number: { fontFamily: font.medium, fontSize: font.size.body, color: colors.text },
  selectedNumber: { fontFamily: font.semiBold, color: colors.background },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  ring: { borderWidth: 1.5, borderColor: colors.text },
  filled: { backgroundColor: colors.success },
});
