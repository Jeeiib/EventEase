// Ce que comptent les lignes du profil : les événements créés, ou les participations, à venir puis passés.
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/EmptyState';
import { EventRow } from '@/components/EventRow';
import { MonthHeader } from '@/components/MonthHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { EventWithStatus } from '@/data/types';
import { useProfileEvents } from '@/hooks/useProfileEvents';
import type { RootStackParamList } from '@/navigation/types';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { toDayKey } from '@/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEvents'>;
type Row = { event: EventWithStatus; firstOfDay: boolean; past: boolean };

// Deux événements le même jour : seul le premier porte la date, comme dans la liste principale.
function toRows(events: EventWithStatus[], past: boolean): Row[] {
  return events.map((event, i) => ({
    event,
    past,
    firstOfDay: i === 0 || toDayKey(new Date(events[i - 1].startsAt)) !== toDayKey(new Date(event.startsAt)),
  }));
}

export function ProfileEventsScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { kind } = route.params;
  const { loaded, now, upcoming, past } = useProfileEvents(kind);
  const total = upcoming.length + past.length;

  const sections = useMemo(
    () =>
      [
        { title: t('profile.list.upcoming'), data: toRows(upcoming, false) },
        { title: t('profile.list.past'), data: toRows(past, true) },
      ].filter((s) => s.data.length > 0),
    [upcoming, past, t],
  );

  const openEvent = useCallback((eventId: number) => navigation.navigate('EventDetail', { eventId }), [navigation]);
  const renderItem = useCallback(
    ({ item }: { item: Row }) =>
      now && (
        <EventRow
          event={item.event}
          firstOfDay={item.firstOfDay}
          past={item.past}
          now={now}
          onOpen={openEvent}
          column="month"
          showStatus={false}
        />
      ),
    [now, openEvent],
  );

  const count = t('profile.list.count', { count: total });
  const summary =
    upcoming.length > 0 ? t('profile.list.withUpcoming', { total: count, upcoming: upcoming.length }) : count;

  const header = (
    <View style={styles.titles}>
      <Text style={text.h1} accessibilityRole="header">
        {kind === 'created' ? t('profile.eventsCreated') : t('profile.participations')}
      </Text>
      {loaded && total > 0 && <Text style={styles.summary}>{summary}</Text>}
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader backLabel={t('profile.list.back')} onBack={navigation.goBack} />
      {loaded && total === 0 ? (
        <>
          <View style={styles.padded}>{header}</View>
          {kind === 'created' ? (
            <EmptyState
              icon="calendarAdd"
              title={t('profile.list.emptyCreated.title')}
              text={t('profile.list.emptyCreated.text')}
              action={{
                label: t('profile.list.emptyCreated.action'),
                onPress: () => navigation.navigate('EventForm', {}),
                variant: 'primary',
              }}
            />
          ) : (
            <EmptyState
              icon="check"
              title={t('profile.list.emptyParticipations.title')}
              text={t('profile.list.emptyParticipations.text')}
              action={{
                label: t('profile.list.emptyParticipations.action'),
                onPress: () => navigation.navigate('Main', { screen: 'Events' }),
                variant: 'secondary',
              }}
            />
          )}
        </>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row) => String(row.event.id)}
          ListHeaderComponent={header}
          renderSectionHeader={({ section }) => <MonthHeader label={section.title} />}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  titles: { paddingTop: 6, paddingBottom: 4 },
  summary: { fontFamily: font.regular, fontSize: font.size.row, color: colors.muted, marginTop: 6 },
  padded: { paddingHorizontal: space.screen },
  list: { paddingHorizontal: space.screen, paddingBottom: 32 },
});
