// Filtre à bascule en pastille : contour gris au repos, fond noir et coche quand il est actif.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, size } from '@/theme/tokens';

type Props = { label: string; selected: boolean; onPress: () => void };

export function FilterChip({ label, selected, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      {selected && <Feather name="check" size={15} color={colors.background} />}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.touch,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: { backgroundColor: colors.text, borderColor: colors.text },
  pressed: { opacity: 0.75 },
  label: { fontFamily: font.medium, fontSize: font.size.label, color: colors.text },
  labelSelected: { color: colors.background },
});
