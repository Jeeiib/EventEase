// Champ mot de passe avec le bouton Afficher / Masquer dans son cadre.
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, font, size } from '@/theme/tokens';
import { TextField, type TextFieldProps } from './TextField';

export function PasswordField(props: Omit<TextFieldProps, 'secureTextEntry' | 'accessory'>): React.JSX.Element {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      accessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? t('common.a11y.hidePassword') : t('common.a11y.showPassword')}
          onPress={() => setVisible((v) => !v)}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
        >
          <Text style={styles.toggleLabel}>{visible ? t('common.hidePassword') : t('common.showPassword')}</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: size.touch,
    minWidth: size.touch,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  toggleLabel: { fontFamily: font.semiBold, fontSize: font.size.row, color: colors.text },
});
