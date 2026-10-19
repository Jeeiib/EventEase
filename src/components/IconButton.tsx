// Bouton icône seul (retour, fermeture) : 44 x 44 pt, libellé obligatoire pour VoiceOver.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors, size } from '@/theme/tokens';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  accessibilityLabel: string;
  onPress: () => void;
};

export function IconButton({ icon, accessibilityLabel, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather name={icon} size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.5 },
});
