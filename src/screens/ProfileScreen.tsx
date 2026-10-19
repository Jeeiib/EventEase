// Profil : qui je suis, ce que j'ai fait dans l'app, déconnexion, et la réinitialisation cachée de la démo.
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { SecondaryButton } from '@/components/PrimaryButton';
import { participationsRepo } from '@/data/participations';
import { usersRepo } from '@/data/users';
import { useDb } from '@/db/DbContext';
import { resetDemoData } from '@/db/seed';
import { joinA11y } from '@/i18n/a11y';
import { hashPassword, makeSalt, sha256 } from '@/services/auth';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';

type Counts = { created: number; participations: number };

export function ProfileScreen(): React.JSX.Element | null {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const db = useDb();
  const { user, signOut } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const userId = user?.id ?? null;

  // Relus à chaque arrivée sur l'onglet : une participation prise ailleurs se voit ici.
  useFocusEffect(
    useCallback(() => {
      if (userId === null) return;
      let active = true;
      Promise.all([usersRepo.countEventsByAuthor(db, userId), participationsRepo.countByUser(db, userId)])
        .then(([created, participations]) => {
          if (active) setCounts({ created, participations });
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [db, userId]),
  );

  const confirmReset = useCallback(() => {
    Alert.alert(t('profile.reset.title'), t('profile.reset.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.reset.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await resetDemoData(db, new Date(), (password, salt) => hashPassword(password, salt, sha256), makeSalt);
            // Les comptes ont été recréés : la session courante ne désigne plus personne.
            await signOut();
          } catch {
            Alert.alert(t('common.unexpectedError'));
          }
        },
      },
    ]);
  }, [db, signOut, t]);

  const leave = useCallback(() => {
    signOut().catch(() => Alert.alert(t('common.unexpectedError')));
  }, [signOut, t]);

  if (!user) return null;
  const version = Constants.expoConfig?.version ?? '';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 16 }]}
    >
      <Text style={text.h1} accessibilityRole="header">
        {t('profile.title')}
      </Text>

      <View style={styles.identity}>
        <Avatar name={user.name} />
        <View style={styles.identityText} accessible accessibilityLabel={joinA11y([user.name, user.email])}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatRow icon="calendar" color={colors.text} label={t('profile.eventsCreated')} value={counts?.created} />
        <StatRow
          icon="check-circle"
          color={colors.success}
          label={t('profile.participations')}
          value={counts?.participations}
          last
        />
      </View>

      <View style={styles.signOut}>
        <SecondaryButton label={t('profile.signOut')} onPress={leave} />
      </View>

      <View style={styles.spacer} />

      {/* Appui long caché pour remettre la démo à zéro avant l'oral : pour VoiceOver, c'est du texte. */}
      <Pressable onLongPress={confirmReset} delayLongPress={800} accessibilityRole="text">
        <Text style={styles.version}>{t('profile.version', { version })}</Text>
      </Pressable>
    </ScrollView>
  );
}

type StatProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  label: string;
  value: number | undefined;
  last?: boolean;
};

function StatRow({ icon, color, label, value, last = false }: StatProps) {
  const shown = value === undefined ? '' : String(value);
  return (
    <View style={[styles.row, last && styles.rowLast]} accessible accessibilityLabel={joinA11y([label, shown])}>
      <Feather name={icon} size={20} color={color} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{shown}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: space.screen },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24 },
  identityText: { flex: 1 },
  name: { fontFamily: font.semiBold, fontSize: font.size.h2, letterSpacing: -0.44, color: colors.text },
  email: { fontFamily: font.regular, fontSize: font.size.row, color: colors.muted, marginTop: 2 },
  stats: { marginTop: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowLast: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { flex: 1, fontFamily: font.medium, fontSize: font.size.row, color: colors.text },
  rowValue: { fontFamily: font.semiBold, fontSize: font.size.row, color: colors.text },
  signOut: { marginTop: 28 },
  spacer: { flex: 1, minHeight: 24 },
  version: {
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: font.size.small,
    color: colors.muted,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
