// Lien texte souligné, avec une zone tactile de 44 pt de haut.
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, size } from '@/theme/tokens';

type Props = { label: string; onPress: () => void };

export function TextLink({ label, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: size.touch, minWidth: size.touch, paddingHorizontal: 4, justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  label: {
    fontFamily: font.semiBold,
    fontSize: font.size.row,
    lineHeight: 20,
    color: colors.text,
    textDecorationLine: 'underline',
  },
});
