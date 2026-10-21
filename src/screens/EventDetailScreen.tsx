// Fiche d'un événement : informations, participation à bascule, modification et suppression pour l'auteur.
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DangerLink } from '@/components/DangerLink';
import { InfoRow } from '@/components/InfoRow';
import { InlineButton } from '@/components/InlineButton';
import { PermissionSheet } from '@/components/PermissionSheet';
import { ParticipationButton } from '@/components/ParticipationButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusTag } from '@/components/StatusTag';
import { TextLink } from '@/components/TextLink';
import { WeatherRow } from '@/components/WeatherRow';
import { useDistance } from '@/hooks/useDistance';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useWeather } from '@/hooks/useWeather';
import type { RootStackParamList } from '@/navigation/types';
import { addToDeviceCalendar } from '@/services/deviceCalendar';
import { openLocationSettings } from '@/services/location';
import { openInMaps } from '@/services/maps';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { formatDayLong, formatTime, isUpcoming } from '@/utils/dates';
import { formatDistance } from '@/utils/distance';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

// « Maison des associations, Croix » : le nom du lieu en titre, la ville en sous-ligne.
function splitPlace(label: string): { name: string; city?: string } {
  const cut = label.lastIndexOf(', ');
  return cut === -1 ? { name: label } : { name: label.slice(0, cut), city: label.slice(cut + 2) };
}

export function EventDetailScreen({ navigation, route }: Props): React.JSX.Element | null {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { event, status, isAuthor, toggleParticipation, remove } = useEventDetail(route.params.eventId);
  const [toggling, setToggling] = useState(false);
  const [calendar, setCalendar] = useState<'idle' | 'busy' | 'denied'>('idle');
  // Pendant la suppression, l'événement disparaît de la base : ce n'est pas un « supprimé ailleurs ».
  const deleting = useRef(false);

  // Supprimé depuis un autre écran pendant qu'on était ailleurs : la fiche n'a plus de sens.
  useEffect(() => {
    if (status === 'missing' && !deleting.current) navigation.goBack();
  }, [status, navigation]);

  const toggle = useCallback(async () => {
    setToggling(true);
    try {
      const result = await toggleParticipation();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      AccessibilityInfo.announceForAccessibility(
        result.isParticipating
          ? t('event.announce.joined', { count: result.participantCount })
          : t('event.announce.left', { count: result.participantCount }),
      );
    } catch {
      Alert.alert(t('common.unexpectedError'));
    } finally {
      setToggling(false);
    }
  }, [toggleParticipation, t]);

  const addToCalendar = useCallback(async () => {
    if (!event) return;
    setCalendar('busy');
    try {
      const result = await addToDeviceCalendar({
        title: event.title,
        startsAt: event.startsAt,
        description: event.description,
        location: event.location?.label ?? null,
      });
      setCalendar(result === 'denied' ? 'denied' : 'idle');
      // Le focus reste sur le bouton : sans annonce, VoiceOver ne verrait pas le message apparu dessous.
      if (result === 'denied') AccessibilityInfo.announceForAccessibility(t('event.calendar.denied'));
      if (result === 'saved') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        AccessibilityInfo.announceForAccessibility(t('event.calendar.added'));
      }
    } catch {
      setCalendar('idle');
      Alert.alert(t('common.unexpectedError'));
    }
  }, [event, t]);

  const confirmDelete = useCallback(() => {
    if (!event) return;
    const count = event.participantCount;
    // Intl.PluralRules range 0 dans « one » en français : le cas zéro a sa propre phrase.
    const message =
      count === 0
        ? t('event.delete.messageNone', { title: event.title })
        : t('event.delete.message', { title: event.title, count });
    Alert.alert(t('event.delete.title'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('event.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          deleting.current = true;
          try {
            await remove();
            navigation.navigate('Main', { screen: 'Events', params: { deletedTitle: event.title } });
          } catch {
            // Échec : la fiche reprend sa garde, et la prochaine relecture dira si l'événement existe encore.
            deleting.current = false;
            Alert.alert(t('common.unexpectedError'));
          }
        },
      },
    ]);
  }, [event, remove, navigation, t]);

  const now = new Date();
  const { weather, retry: retryWeather } = useWeather(event?.location ?? null, event?.startsAt ?? '', now);
  const {
    distance,
    request: requestDistance,
    confirm: confirmDistance,
    dismiss: dismissDistance,
  } = useDistance(event?.location ?? null);

  if (!event) return null;

  const start = new Date(event.startsAt);
  const past = !isUpcoming(event.startsAt, now);
  const location = event.location;
  const place = location ? splitPlace(location.label) : null;
  const participants = event.isParticipating
    ? t('event.participantsWithYou', { count: event.participantCount })
    : t('event.participants', { count: event.participantCount });

  // Le retour dit où il mène : la fiche s'ouvre depuis la liste, le calendrier ou les listes du profil.
  const previous = navigation.getState().routes.at(-2);
  // Sous les onglets, c'est l'onglet affiché qui dit d'où l'on vient.
  const from = previous?.name === 'Main' ? previous.state?.routes[previous.state.index ?? 0]?.name : previous?.name;
  const backLabel =
    from === 'ProfileEvents'
      ? t('event.a11y.backToList')
      : from === 'Calendar'
        ? t('event.a11y.backToCalendar')
        : t('event.a11y.back');

  return (
    <View style={styles.screen}>
      <ScreenHeader
        backLabel={backLabel}
        onBack={navigation.goBack}
        action={
          isAuthor
            ? {
                label: t('event.edit'),
                icon: 'edit-2',
                onPress: () => navigation.navigate('EventForm', { eventId: event.id }),
              }
            : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.tags}>
          {isAuthor && <StatusTag label={t('event.youOrganize')} icon="user" tone="muted" />}
          {event.isParticipating && (
            <StatusTag label={past ? t('event.participated') : t('event.participating')} icon="check" tone="success" />
          )}
          {past && <StatusTag label={t('event.ended')} icon="clock" tone="muted" />}
        </View>

        <Text style={[text.h1, styles.title]} accessibilityRole="header">
          {event.title}
        </Text>

        <InfoRow icon="calendar" title={formatDayLong(start, now)} subtitle={formatTime(start)}>
          {!past && (
            <InlineButton
              label={t('event.calendar.add')}
              icon="calendar"
              busy={calendar === 'busy'}
              onPress={addToCalendar}
            />
          )}
          {!past && calendar === 'denied' && (
            <View style={styles.calendarDenied}>
              <Text style={styles.calendarDeniedText}>{t('event.calendar.denied')}</Text>
              <TextLink label={t('event.calendar.openSettings')} onPress={() => void Linking.openSettings()} />
            </View>
          )}
        </InfoRow>
        {location && place && (
          <InfoRow
            icon="map-pin"
            title={distance.status === 'ready' ? location.label : place.name}
            subtitle={
              distance.status === 'ready'
                ? t('event.distance.result', { distance: formatDistance(distance.meters) })
                : place.city
            }
          >
            <View style={styles.inlineButtons}>
              <InlineButton
                label={t('event.directions.action')}
                hint={t('event.directions.hint')}
                icon="corner-up-right"
                onPress={() => openInMaps(location).catch(() => Alert.alert(t('common.unexpectedError')))}
              />
              {distance.status !== 'ready' && distance.status !== 'error' && (
                <InlineButton
                  label={distance.status === 'locating' ? t('event.distance.loading') : t('event.distance.action')}
                  icon="navigation"
                  busy={distance.status === 'locating'}
                  onPress={() => void requestDistance()}
                />
              )}
            </View>
            {distance.status === 'denied' && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>{t('event.distance.denied')}</Text>
                <InlineButton
                  label={t('event.distance.openSettings')}
                  icon="settings"
                  onPress={() => void openLocationSettings()}
                />
              </View>
            )}
            {distance.status === 'error' && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>{t('event.distance.unavailable')}</Text>
                <InlineButton label={t('common.retry')} onPress={() => void requestDistance()} />
              </View>
            )}
          </InfoRow>
        )}
        <WeatherRow weather={weather} now={now} onRetry={retryWeather} />
        <InfoRow
          icon="users"
          title={participants}
          subtitle={isAuthor ? t('event.organizedByYou') : t('event.organizedBy', { name: event.authorName })}
          last
        />

        <Text style={styles.description}>{event.description}</Text>

        {isAuthor && (
          <View style={styles.delete}>
            <DangerLink label={t('event.delete.action')} icon="trash-2" onPress={confirmDelete} />
          </View>
        )}
      </ScrollView>

      {distance.status === 'explaining' && (
        <PermissionSheet onContinue={() => void confirmDistance()} onNotNow={dismissDistance} />
      )}

      {/* Barre basse fixe : l'action principale reste à portée de pouce, quelle que soit la longueur de la fiche. */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {past && !event.isParticipating && <Text style={styles.help}>{t('event.wereYouThere')}</Text>}
        <ParticipationButton participating={event.isParticipating} past={past} loading={toggling} onPress={toggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: 10, alignItems: 'flex-start' },
  noticeText: { fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 20, color: colors.text },
  inlineButtons: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8 },
  calendarDenied: { marginTop: 10, gap: 4, alignItems: 'flex-start' },
  calendarDeniedText: { fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 19, color: colors.text },
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingTop: 8, paddingHorizontal: space.screen, paddingBottom: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6 },
  title: { marginTop: 10, marginBottom: 20 },
  description: {
    marginTop: 18,
    fontFamily: font.regular,
    fontSize: font.size.body,
    lineHeight: 25,
    color: colors.text,
  },
  delete: { marginTop: 10 },
  bar: {
    paddingTop: 14,
    paddingHorizontal: space.screen,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
  help: {
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: font.size.meta,
    lineHeight: 20,
    color: colors.muted,
  },
});
