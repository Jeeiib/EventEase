// Champ de saisie avec libellé, aide et erreur sous le champ, lus d'un seul tenant par VoiceOver.
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, font, radius, size } from '@/theme/tokens';
import { text } from '@/theme/typography';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'accessibilityHint'> & {
  label: string;
  hint?: string;
  error?: string | null;
  // Élément à droite dans le cadre du champ (bouton Afficher du mot de passe).
  accessory?: ReactNode;
  ref?: Ref<TextInput>;
};

export function TextField({ label, hint, error, accessory, ref, onFocus, onBlur, ...input }: TextFieldProps): React.JSX.Element {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {/* Le libellé visible est masqué à VoiceOver : il est déjà porté par le champ. */}
      <Text style={[text.label, styles.label]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {label}
      </Text>
      <View style={[styles.frame, focused && styles.focused, !!error && styles.invalid, !!accessory && styles.withAccessory]}>
        <TextInput
          ref={ref}
          {...input}
          accessibilityLabel={error ? t('common.a11y.fieldError', { label, error }) : label}
          accessibilityHint={hint}
          placeholderTextColor={colors.muted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
        {accessory}
      </View>
      {error ? (
        <View style={styles.message} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Feather name="alert-circle" size={16} color={colors.danger} style={styles.errorIcon} />
          <Text style={[text.error, styles.messageText]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[text.hint, styles.hint]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8 },
  frame: {
    minHeight: size.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.input,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Le focus épaissit le trait sans décaler le texte : on retire la demi-épaisseur ajoutée.
  focused: { borderWidth: 2, borderColor: colors.text, paddingHorizontal: 15.5 },
  invalid: { borderColor: colors.danger },
  withAccessory: { paddingRight: 4 },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: size.input - 4,
    paddingVertical: 12,
    fontFamily: font.regular,
    fontSize: font.size.body,
    color: colors.text,
  },
  message: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 8 },
  errorIcon: { marginTop: 2 },
  messageText: { flex: 1 },
  hint: { marginTop: 8 },
});
