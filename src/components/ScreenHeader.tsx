// En-tête maison d'un écran poussé : retour à gauche, action texte facultative à droite.
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, size } from '@/theme/tokens';
import { BAR_MAX_SCALE } from '@/theme/typography';
import { IconButton } from './IconButton';

type Props = {
  backLabel: string;
  onBack: () => void;
  action?: { label: string; icon: React.ComponentProps<typeof Feather>['name']; onPress: () => void };
};

export function ScreenHeader({ backLabel, onBack, action }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <IconButton icon="chevron-left" accessibilityLabel={backLabel} onPress={onBack} />
      {action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Feather name={action.icon} size={18} color={colors.text} />
          <Text style={styles.actionLabel} maxFontSizeMultiplier={BAR_MAX_SCALE}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 12,
  },
  action: {
    minHeight: size.touch,
    minWidth: size.touch,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: { opacity: 0.5 },
  actionLabel: { fontFamily: font.semiBold, fontSize: font.size.title, color: colors.text },
});
