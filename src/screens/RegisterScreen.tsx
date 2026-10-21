// Inscription : nom, e-mail, mot de passe, avec chaque erreur affichée sous son champ.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthContext';
import { AuthLayout } from '@/components/AuthLayout';
import { ErrorBanner } from '@/components/ErrorBanner';
import { IconButton } from '@/components/IconButton';
import { PasswordField } from '@/components/PasswordField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextField } from '@/components/TextField';
import type { AuthScreenProps } from '@/navigation/types';
import { LARGE_TITLE_MAX_SCALE, text } from '@/theme/typography';
import { validateEmail, validateName, validatePassword } from '@/utils/validation';

type Field = 'name' | 'email' | 'password';
type Errors = Partial<Record<Field, string>>;

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>): React.JSX.Element {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // Un nouvel objet à chaque demande, pour refocaliser même si le champ fautif est le même.
  const [focusRequest, setFocusRequest] = useState<{ field: Field } | null>(null);
  // La touche « Aller » du clavier ne passe pas par le bouton : on garde l'envoi en cours ici.
  const inFlight = useRef(false);
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  function change(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // L'erreur disparaît dès qu'on corrige le champ concerné.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): Errors {
    const found: Errors = {};
    if (validateName(values.name)) found.name = t('auth.register.errors.nameRequired');
    const email = validateEmail(values.email);
    if (email === 'required') found.email = t('auth.register.errors.emailRequired');
    if (email === 'invalid') found.email = t('auth.register.errors.emailInvalid');
    const password = validatePassword(values.password);
    if (password) found.password = t('auth.register.errors.passwordTooShort', { count: password.missing });
    return found;
  }

  // Le focus va sur le premier champ fautif une fois l'erreur affichée : VoiceOver lit alors
  // son libellé, qui contient déjà l'erreur.
  useEffect(() => {
    if (!focusRequest) return;
    const refs = { name: nameRef, email: emailRef, password: passwordRef };
    refs[focusRequest.field].current?.focus();
  }, [focusRequest]);

  function showErrors(found: Errors) {
    setErrors(found);
    const field = (['name', 'email', 'password'] as const).find((f) => found[f]);
    if (field) setFocusRequest({ field });
  }

  async function submit() {
    if (inFlight.current) return;
    const found = validate();
    if (Object.keys(found).length > 0) return showErrors(found);
    inFlight.current = true;
    // Le clavier masquerait le bouton en chargement.
    Keyboard.dismiss();
    setFailure(null);
    setSending(true);
    try {
      const error = await signUp(values.name, values.email, values.password);
      // En cas de succès, la navigation bascule d'elle-même sur les onglets.
      if (error === 'emailTaken') {
        setSending(false);
        showErrors({ email: t('auth.register.errors.emailTaken') });
      }
    } catch {
      setSending(false);
      setFailure(t('common.unexpectedError'));
      AccessibilityInfo.announceForAccessibility(t('common.unexpectedError'));
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <AuthLayout
      top={
        <View style={styles.back}>
          <IconButton
            icon="chevron-left"
            accessibilityLabel={t('auth.register.a11y.back')}
            onPress={navigation.goBack}
          />
        </View>
      }
      footerText={t('auth.register.hasAccount')}
      footerAction={t('auth.register.signIn')}
      onFooterPress={navigation.goBack}
    >
      <Text style={[text.h1, styles.title]} accessibilityRole="header" maxFontSizeMultiplier={LARGE_TITLE_MAX_SCALE}>
        {t('auth.register.title')}
      </Text>
      <Text style={[text.subtitle, styles.subtitle]}>{t('auth.register.subtitle')}</Text>

      <View style={styles.fields}>
        <TextField
          ref={nameRef}
          label={t('auth.register.name')}
          placeholder={t('auth.register.namePlaceholder')}
          value={values.name}
          onChangeText={(v) => change('name', v)}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label={t('auth.login.email')}
          placeholder={t('auth.login.emailPlaceholder')}
          value={values.email}
          onChangeText={(v) => change('email', v)}
          error={errors.email}
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
          hint={t('auth.register.passwordHint')}
          value={values.password}
          onChangeText={(v) => change('password', v)}
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
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
        <PrimaryButton label={t('auth.register.submit')} onPress={submit} loading={sending} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  back: { paddingHorizontal: 12, paddingTop: 4 },
  title: { marginTop: 10 },
  subtitle: { marginTop: 10 },
  fields: { marginTop: 30, gap: 18 },
  banner: { marginTop: 22 },
  submit: { marginTop: 28 },
  submitAfterBanner: { marginTop: 18 },
});
