// Champ de saisie avec libellé, aide et erreur sous le champ, lus d'un seul tenant par VoiceOver.
import { useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { joinA11y } from '@/i18n/a11y';
import { colors, font, radius, size } from '@/theme/tokens';
import { FieldLabel, FieldMessage } from './FieldError';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'accessibilityHint'> & {
  label: string;
  // Mention affichée après le libellé, ex. « (facultatif) ».
  optional?: string;
  hint?: string;
  error?: string | null;
  // Élément à droite dans le cadre du champ (bouton Afficher du mot de passe).
  accessory?: ReactNode;
  // Zone de texte sur plusieurs lignes (description).
  tall?: boolean;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  optional,
  hint,
  error,
  accessory,
  tall = false,
  ref,
  onFocus,
  onBlur,
  ...input
}: TextFieldProps): React.JSX.Element {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const spoken = joinA11y([label, optional]);

  return (
    <View>
      <FieldLabel label={label} optional={optional} />
      <View
        style={[
          styles.frame,
          tall && styles.tallFrame,
          focused && styles.focused,
          !!error && styles.invalid,
          !!accessory && styles.withAccessory,
        ]}
      >
        <TextInput
          ref={ref}
          multiline={tall}
          {...input}
          accessibilityLabel={error ? t('common.a11y.fieldError', { label: spoken, error }) : spoken}
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
          style={[styles.input, tall && styles.tallInput]}
        />
        {accessory}
      </View>
      <FieldMessage error={error} hint={hint} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  tallFrame: { minHeight: 112, alignItems: 'stretch' },
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
  tallInput: { paddingTop: 14, paddingBottom: 14, lineHeight: 23, textAlignVertical: 'top' },
});
