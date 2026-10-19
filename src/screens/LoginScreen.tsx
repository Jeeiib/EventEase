// Connexion : e-mail et mot de passe, une seule erreur possible en bandeau.
import { useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Logo } from '@/components/Logo';
import { PasswordField } from '@/components/PasswordField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import type { AuthScreenProps } from '@/navigation/types';
import { colors, font, space } from '@/theme/tokens';
import { text } from '@/theme/typography';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>): React.JSX.Element {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  // La touche « Aller » du clavier ne passe pas par le bouton : on garde l'envoi en cours ici.
  const inFlight = useRef(false);

  function edit(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setFailure(null);
    };
  }

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    // Le clavier masquerait le bandeau ou le bouton en chargement.
    Keyboard.dismiss();
    setSending(true);
    let message: string | null = null;
    try {
      const error = await signIn(email, password);
      // En cas de succès, la navigation bascule d'elle-même sur les onglets.
      if (error) message = t('auth.login.invalidCredentials');
    } catch {
      message = t('common.unexpectedError');
    } finally {
      inFlight.current = false;
    }
    if (message) {
      setSending(false);
      setFailure(message);
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  return (
    <AuthLayout
      top={
        <View style={styles.brand}>
          <Logo size={40} />
          <Text style={styles.brandName}>{t('common.appName')}</Text>
        </View>
      }
      footerText={t('auth.login.noAccount')}
      footerAction={t('auth.login.createAccount')}
      onFooterPress={() => navigation.navigate('Register')}
    >
      <Text style={[text.h1, styles.title]} accessibilityRole="header">
        {t('auth.login.title')}
      </Text>
      <Text style={[text.subtitle, styles.subtitle]}>{t('auth.login.subtitle')}</Text>

      <View style={styles.fields}>
        <TextField
          label={t('auth.login.email')}
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChangeText={edit(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <PasswordField
          ref={passwordRef}
          label={t('auth.login.password')}
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChangeText={edit(setPassword)}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>

      {failure && (
        <View style={styles.banner}>
          <ErrorBanner message={failure} />
        </View>
      )}

      <View style={failure ? styles.submitAfterBanner : styles.submit}>
        <PrimaryButton label={t('auth.login.submit')} onPress={submit} loading={sending} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: space.authScreen,
    paddingTop: 42,
  },
  brandName: { fontFamily: font.semiBold, fontSize: 22, letterSpacing: -0.66, color: colors.text },
  title: { marginTop: 44 },
  subtitle: { marginTop: 10 },
  fields: { marginTop: 32, gap: 18 },
  banner: { marginTop: 22 },
  submit: { marginTop: 28 },
  submitAfterBanner: { marginTop: 18 },
});
