// Bouton principal noir pleine largeur, et sa variante secondaire à contour.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, size } from '@/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  /** Largeur du texte au lieu de la pleine largeur (états vides). */
  compact?: boolean;
  /** Bouton à bascule (participer) : VoiceOver annonce « sélectionné ». */
  selected?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  compact = false,
  selected,
}: Props): React.JSX.Element {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, selected }}
      // Pendant l'envoi, un second appui ne relance rien (pas de double inscription).
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        secondary ? styles.secondary : styles.primary,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.text : colors.background} />
      ) : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton(props: Omit<Props, 'variant'>): React.JSX.Element {
  return <PrimaryButton {...props} variant="secondary" />;
}

const styles = StyleSheet.create({
  base: {
    minHeight: size.button,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primary: { backgroundColor: colors.text },
  secondary: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.text },
  compact: { alignSelf: 'flex-start', paddingHorizontal: 22 },
  pressed: { opacity: 0.75 },
  label: {
    fontFamily: font.semiBold,
    fontSize: font.size.body,
    lineHeight: 22,
    color: colors.background,
    textAlign: 'center',
  },
  secondaryLabel: { color: colors.text },
});
