// Bandeau de la semaine en cours : un seul bouton pour VoiceOver, qui résume la semaine et ouvre le calendrier.
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EventWithStatus } from '@/data/types';
import { colors, font, size } from '@/theme/tokens';
import { formatWeekdayShort, toDayKey } from '@/utils/dates';
import { weekStripLabel } from '@/utils/weekLabel';

// Sept colonnes de 44 pt doivent tenir sur la largeur : au-delà, les chiffres déborderaient.
const MAX_SCALE = 1.6;

type Props = {
  week: Date[];
  weekEvents: EventWithStatus[];
  markers: Record<string, 'event' | 'participating'>;
  now: Date;
  onPress: () => void;
};

export const WeekStrip = memo(function WeekStrip({ week, weekEvents, markers, now, onPress }: Props) {
  const { t } = useTranslation();
  const todayKey = toDayKey(now);

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={weekStripLabel(week, weekEvents, now, t)}
      accessibilityHint={t('list.weekStrip.hint')}
      onPress={onPress}
      style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
    >
      <View style={styles.days} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {week.map((day) => {
          const key = toDayKey(day);
          const marker = markers[key];
          const isToday = key === todayKey;
          return (
            <View key={key} style={styles.day}>
              <Text style={styles.weekday} maxFontSizeMultiplier={MAX_SCALE}>
                {formatWeekdayShort(day)}
              </Text>
              <View style={[styles.number, isToday && styles.today]}>
                <Text style={[styles.numberText, isToday && styles.todayText]} maxFontSizeMultiplier={MAX_SCALE}>
                  {day.getDate()}
                </Text>
              </View>
              <View style={[styles.dot, marker === 'event' && styles.dotEvent, marker === 'participating' && styles.dotMine]} />
            </View>
          );
        })}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  strip: {
    marginTop: 6,
    marginHorizontal: 13,
    marginBottom: 2,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pressed: { opacity: 0.6 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
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
