// Bouton secondaire placé dans une ligne de la fiche (calendrier, distance) : contour noir, icône et libellé.
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, size } from '@/theme/tokens';

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  hint?: string;
  busy?: boolean;
};

export function InlineButton({ label, icon, onPress, hint, busy = false }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        icon && <Feather name={icon} size={18} color={colors.text} />
      )}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginTop: 8,
    minHeight: size.touch,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.6 },
  label: { fontFamily: font.semiBold, fontSize: font.size.meta, color: colors.text },
});
