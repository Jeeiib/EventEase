// Écran de secours quand la base ne s'ouvre pas au lancement : explique et propose de réessayer.
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, space } from '@/theme/tokens';
import { text } from '@/theme/typography';

export function StartupErrorScreen({ onRetry }: { onRetry: () => void }): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.screen}>
      <Logo size={64} accessibilityLabel={t('common.appName')} />
      <Text style={[text.body, styles.message]} accessibilityRole="alert">
        {t('common.startupError')}
      </Text>
      <View style={styles.action}>
        <PrimaryButton label={t('common.retry')} onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.authScreen,
  },
  message: { marginTop: 24, textAlign: 'center' },
  action: { marginTop: 28, alignSelf: 'stretch' },
});
