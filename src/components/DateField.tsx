// Champ « Date et heure » : un bouton qui ouvre le sélecteur, avec l'erreur sous le champ comme un champ texte.
import { Feather } from '@expo/vector-icons';
import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { joinA11y } from '@/i18n/a11y';
import { colors, font, radius, size } from '@/theme/tokens';
import { FieldLabel, FieldMessage } from './FieldError';

type Props = {
  label: string;
  // Valeur déjà formatée (« Samedi 31 octobre, 9h30 »), ou null tant qu'aucune date n'est choisie.
  value: string | null;
  placeholder: string;
  error?: string | null;
  onPress: () => void;
  ref?: Ref<View>;
};

export function DateField({ label, value, placeholder, error, onPress, ref }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const spoken = joinA11y([label, value ?? placeholder]);
  return (
    <View>
      <FieldLabel label={label} />
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={error ? t('common.a11y.fieldError', { label: spoken, error }) : spoken}
        onPress={onPress}
        style={({ pressed }) => [styles.frame, !!error && styles.invalid, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value ?? placeholder}</Text>
        <Feather name="calendar" size={20} color={colors.text} />
      </Pressable>
      <FieldMessage error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    minHeight: size.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  invalid: { borderColor: colors.danger },
  pressed: { opacity: 0.7 },
  value: { flex: 1, fontFamily: font.regular, fontSize: font.size.body, color: colors.text },
  placeholder: { color: colors.muted },
});
