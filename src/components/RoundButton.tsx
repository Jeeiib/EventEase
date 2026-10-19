// Bouton rond noir de 44 pt (créer un événement), libellé obligatoire pour VoiceOver.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors, size } from '@/theme/tokens';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  accessibilityLabel: string;
  onPress: () => void;
};

export function RoundButton({ icon, accessibilityLabel, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather name={icon} size={22} color={colors.background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: size.touch,
    height: size.touch,
    borderRadius: size.touch / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
