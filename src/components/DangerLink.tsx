// Action destructrice en texte rouge (supprimer), toujours suivie d'une confirmation.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, size } from '@/theme/tokens';

type Props = { label: string; icon: React.ComponentProps<typeof Feather>['name']; onPress: () => void };

export function DangerLink({ label, icon, onPress }: Props): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Feather name={icon} size={20} color={colors.danger} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    minHeight: size.button,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.6 },
  label: { fontFamily: font.semiBold, fontSize: font.size.body, color: colors.danger },
});
