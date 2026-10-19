// Fiche d'un événement : informations, participation à bascule, modification et suppression pour l'auteur.
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DangerLink } from '@/components/DangerLink';
import { InfoRow } from '@/components/InfoRow';
import { ParticipationButton } from '@/components/ParticipationButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusTag } from '@/components/StatusTag';
import { useEventDetail } from '@/hooks/useEventDetail';
import type { RootStackParamList } from '@/navigation/types';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { formatDayLong, formatTime, isUpcoming } from '@/utils/dates';

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

  if (!event) return null;

  const now = new Date();
  const start = new Date(event.startsAt);
  const past = !isUpcoming(event.startsAt, now);
  const place = event.location ? splitPlace(event.location.label) : null;
  const participants = event.isParticipating
    ? t('event.participantsWithYou', { count: event.participantCount })
    : t('event.participants', { count: event.participantCount });

  return (
    <View style={styles.screen}>
      <ScreenHeader
        backLabel={t('event.a11y.back')}
        onBack={navigation.goBack}
        action={
          isAuthor
            ? { label: t('event.edit'), icon: 'edit-2', onPress: () => navigation.navigate('EventForm', { eventId: event.id }) }
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

        <InfoRow icon="calendar" title={formatDayLong(start, now)} subtitle={formatTime(start)} />
        {place && <InfoRow icon="map-pin" title={place.name} subtitle={place.city} />}
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

      {/* Barre basse fixe : l'action principale reste à portée de pouce, quelle que soit la longueur de la fiche. */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {past && !event.isParticipating && <Text style={styles.help}>{t('event.wereYouThere')}</Text>}
        <ParticipationButton participating={event.isParticipating} past={past} loading={toggling} onPress={toggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingTop: 8, paddingHorizontal: space.screen, paddingBottom: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6 },
  title: { marginTop: 10, marginBottom: 20 },
  description: { marginTop: 18, fontFamily: font.regular, fontSize: font.size.body, lineHeight: 25, color: colors.text },
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
