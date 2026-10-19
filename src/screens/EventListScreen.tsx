// Liste des événements : À venir ou Passés, filtre « Mes participations », semaine en cours en tête.
import { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { DeletedBanner } from '@/components/DeletedBanner';
import { EmptyState } from '@/components/EmptyState';
import { EventRow } from '@/components/EventRow';
import { FilterChip } from '@/components/FilterChip';
import { MonthHeader } from '@/components/MonthHeader';
import { RoundButton } from '@/components/RoundButton';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { WeekStrip } from '@/components/WeekStrip';
import type { EventWithStatus } from '@/data/types';
import { useEventList, type EventListView } from '@/hooks/useEventList';
import type { MainTabScreenProps } from '@/navigation/types';
import { colors, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { formatMonthHeader, fromDayKey } from '@/utils/dates';

type Row = { event: EventWithStatus; firstOfDay: boolean };

export function EventListScreen({ navigation, route }: MainTabScreenProps<'Events'>): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { view, setView, mineOnly, setMineOnly, sections, markers, week, weekEvents, now, total } = useEventList();
  const deletedTitle = route.params?.deletedTitle;

  const listSections = useMemo(
    () =>
      sections.map((month) => ({
        key: month.monthKey,
        title: formatMonthHeader(fromDayKey(`${month.monthKey}-01`), now),
        data: month.days.flatMap((day) => day.events.map((event, i): Row => ({ event, firstOfDay: i === 0 }))),
      })),
    [sections, now],
  );

  const create = useCallback(() => navigation.navigate('EventForm', {}), [navigation]);
  const hideDeleted = useCallback(() => navigation.setParams({ deletedTitle: undefined }), [navigation]);

  const empty = emptyContent(view, mineOnly, total, t, create, () => setMineOnly(false));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Text style={text.h1} accessibilityRole="header">
          {t('list.title')}
        </Text>
        <RoundButton icon="plus" accessibilityLabel={t('list.a11y.create')} onPress={create} />
      </View>

      {/* La rangée de contrôle ne défile jamais : on change de vue sans perdre ses repères. */}
      <View style={styles.controls}>
        <SegmentedTabs<EventListView>
          options={[
            { value: 'upcoming', label: t('list.upcoming') },
            { value: 'past', label: t('list.past') },
          ]}
          value={view}
          onChange={setView}
        />
        <FilterChip label={t('list.mine')} selected={mineOnly} onPress={() => setMineOnly(!mineOnly)} />
      </View>

      {deletedTitle && <DeletedBanner message={t('list.deletedBanner', { title: deletedTitle })} onHide={hideDeleted} />}

      {view === 'upcoming' && (
        <WeekStrip
          week={week}
          weekEvents={weekEvents}
          markers={markers}
          now={now}
          onPress={() => navigation.navigate('Calendar')}
        />
      )}

      {listSections.length === 0 ? (
        <EmptyState {...empty} />
      ) : (
        <SectionList
          sections={listSections}
          keyExtractor={(row) => String(row.event.id)}
          renderSectionHeader={({ section }) => <MonthHeader label={section.title} />}
          renderItem={({ item }) => (
            <EventRow
              event={item.event}
              firstOfDay={item.firstOfDay}
              past={view === 'past'}
              now={now}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
            />
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

type T = ReturnType<typeof useTranslation>['t'];

function emptyContent(
  view: EventListView,
  mineOnly: boolean,
  total: number,
  t: T,
  create: () => void,
  clearFilter: () => void,
): React.ComponentProps<typeof EmptyState> {
  if (view === 'upcoming' && !mineOnly) {
    return {
      icon: 'calendarAdd',
      title: t('list.empty.upcoming.title'),
      text: t('list.empty.upcoming.text'),
      action: { label: t('list.empty.upcoming.action'), onPress: create, variant: 'primary' },
    };
  }
  if (view === 'upcoming') {
    return {
      icon: 'check',
      title: t('list.empty.mineUpcoming.title'),
      text: t('list.empty.mineUpcoming.text', { count: total }),
      action: { label: t('list.empty.mineUpcoming.action'), onPress: clearFilter, variant: 'secondary' },
    };
  }
  if (mineOnly) {
    return {
      icon: 'clock',
      title: t('list.empty.minePast.title'),
      text: t('list.empty.minePast.text'),
      action: { label: t('list.empty.minePast.action'), onPress: clearFilter, variant: 'secondary' },
    };
  }
  return { icon: 'clock', title: t('list.empty.past.title'), text: t('list.empty.past.text') };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screen,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 20,
    paddingTop: 14,
    paddingBottom: 8,
    paddingHorizontal: space.screen,
  },
  list: { paddingHorizontal: space.screen, paddingBottom: 24 },
});
