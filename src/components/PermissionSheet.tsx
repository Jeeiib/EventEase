// Explication avant la demande de position : l'utilisateur sait pourquoi le système va lui poser la question.
import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, font, space } from '@/theme/tokens';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';
import { TextLink } from './TextLink';

type Props = { onContinue: () => void; onNotNow: () => void };

export function PermissionSheet({ onContinue, onNotNow }: Props): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <BottomSheet visible onDismiss={onNotNow} style={styles.sheet}>
      {(close) => (
        <>
          <View style={styles.grabber} />
          <Feather name="navigation" size={34} color={colors.text} style={styles.icon} />
          <Text style={styles.title} accessibilityRole="header">
            {t('event.distance.action')}
          </Text>
          <Text style={styles.body}>{t('event.distance.explain')}</Text>
          <Text style={styles.next}>
            {Platform.OS === 'ios' ? t('event.distance.nextIos') : t('event.distance.nextAndroid')}
          </Text>
          <View style={styles.actions}>
            <PrimaryButton label={t('event.distance.continue')} onPress={() => close(onContinue)} />
            <View style={styles.notNow}>
              <TextLink label={t('event.distance.notNow')} onPress={() => close(onNotNow)} />
            </View>
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingTop: 10, paddingHorizontal: space.screen, gap: 14 },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.grabber,
    alignSelf: 'center',
    marginBottom: 6,
  },
  icon: { alignSelf: 'flex-start' },
  title: { fontFamily: font.semiBold, fontSize: 24, letterSpacing: -0.48, color: colors.text },
  body: { fontFamily: font.regular, fontSize: font.size.body, lineHeight: 24, color: colors.muted },
  next: { fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 20, color: colors.muted },
  actions: { gap: 8, marginTop: 6 },
  notNow: { alignItems: 'center', minHeight: 48, justifyContent: 'center' },
});
