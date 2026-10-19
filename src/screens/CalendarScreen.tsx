// Calendrier : le mois en grille, les jours marqués comme le bandeau de la liste, et les événements du jour choisi.
import { t as translate } from 'i18next';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CalendarDay, type DayMarking } from '@/components/CalendarDay';
import { EventRow } from '@/components/EventRow';
import { IconButton } from '@/components/IconButton';
import { useEventList } from '@/hooks/useEventList';
import { getAppLocale } from '@/i18n';
import type { MainTabScreenProps } from '@/navigation/types';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import {
  dayNames,
  dayNamesShort,
  formatDayLong,
  formatMonthYear,
  fromDayKey,
  isUpcoming,
  monthNames,
  monthNamesShort,
  toDayKey,
} from '@/utils/dates';

// Noms de mois et de jours fournis par Intl, posés une fois pour toute l'app.
const locale = getAppLocale();
LocaleConfig.locales[locale] = {
  monthNames: monthNames(locale),
  monthNamesShort: monthNamesShort(locale),
  dayNames: dayNames(locale),
  dayNamesShort: dayNamesShort(locale),
  today: translate('calendar.today'),
};
LocaleConfig.defaultLocale = locale;

const theme = {
  calendarBackground: colors.background,
  textSectionTitleColor: colors.muted,
  textDayHeaderFontFamily: font.regular,
  textDayHeaderFontSize: font.size.weekday,
  weekVerticalMargin: 1,
};

function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function shiftMonth(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function CalendarScreen({ navigation }: MainTabScreenProps<'Calendar'>): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { events, markers, now } = useEventList();
  const todayKey = toDayKey(now);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [month, setMonth] = useState(() => firstOfMonth(now));

  const markedDates = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      const key = toDayKey(new Date(e.startsAt));
      counts[key] = (counts[key] ?? 0) + 1;
    }
    // Un nouvel objet à chaque changement : la grille ne se redessine que si la référence change.
    const marked: Record<string, DayMarking> = {};
    for (const key of new Set([...Object.keys(markers), selectedKey, todayKey])) {
      marked[key] = {
        marker: markers[key],
        count: counts[key] ?? 0,
        selected: key === selectedKey,
        today: key === todayKey,
        past: key < todayKey,
      };
    }
    return marked;
  }, [events, markers, selectedKey, todayKey]);

  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => toDayKey(new Date(e.startsAt)) === selectedKey)
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [events, selectedKey],
  );

  const openEvent = useCallback((eventId: number) => navigation.navigate('EventDetail', { eventId }), [navigation]);
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const monthName = (d: Date) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <Text style={text.h1} accessibilityRole="header">
        {t('calendar.title')}
      </Text>

      {/* En-tête maison : les flèches de la bibliothèque n'ont ni libellé VoiceOver ni cible de 44 pt. */}
      <View style={styles.monthBar}>
        <Text style={styles.monthTitle} accessibilityRole="header">
          {formatMonthYear(month)}
        </Text>
        <View style={styles.arrows}>
          <IconButton
            icon="chevron-left"
            accessibilityLabel={t('calendar.a11y.prevMonth', { month: monthName(previous) })}
            onPress={() => setMonth(previous)}
          />
          <IconButton
            icon="chevron-right"
            accessibilityLabel={t('calendar.a11y.nextMonth', { month: monthName(next) })}
            onPress={() => setMonth(next)}
          />
        </View>
      </View>

      <Calendar
        key={toDayKey(month)}
        initialDate={toDayKey(month)}
        firstDay={1}
        hideExtraDays
        hideArrows
        enableSwipeMonths
        disableMonthChange
        renderHeader={() => null}
        onMonthChange={(d) => setMonth(new Date(d.year, d.month - 1, 1))}
        dayComponent={CalendarDay}
        markedDates={markedDates}
        onDayPress={(d) => setSelectedKey(d.dateString)}
        theme={theme}
        style={styles.calendar}
      />

      {/* La légende est décorative : chaque cellule dit déjà ce qu'elle porte. */}
      <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.ring]} />
          <Text style={styles.legendText}>{t('calendar.legend.event')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.filled]} />
          <Text style={styles.legendText}>{t('calendar.legend.participating')}</Text>
        </View>
      </View>

      <Text style={styles.dayTitle} accessibilityRole="header">
        {formatDayLong(fromDayKey(selectedKey), now)}
      </Text>
      {dayEvents.length === 0 ? (
        <View style={styles.nothing}>
          <Text style={styles.nothingText}>{t('calendar.nothing')}</Text>
        </View>
      ) : (
        dayEvents.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            firstOfDay
            past={!isUpcoming(event.startsAt, now)}
            now={now}
            onOpen={openEvent}
            column="time"
            showStatus={false}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.screen, paddingBottom: 32 },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  monthTitle: { fontFamily: font.semiBold, fontSize: 20, letterSpacing: -0.4, color: colors.text },
  arrows: { flexDirection: 'row', marginRight: -10 },
  calendar: { marginHorizontal: -space.screen + 8 },
  legend: { flexDirection: 'row', gap: 18, paddingHorizontal: 6, paddingTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontFamily: font.regular, fontSize: font.size.small, color: colors.text },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  ring: { borderWidth: 1.5, borderColor: colors.text },
  filled: { backgroundColor: colors.success },
  dayTitle: {
    fontFamily: font.semiBold,
    fontSize: font.size.title,
    color: colors.text,
    paddingTop: 24,
    paddingBottom: 8,
  },
  nothing: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 18 },
  nothingText: { fontFamily: font.medium, fontSize: font.size.body, color: colors.text },
});
