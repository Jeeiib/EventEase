// En-tête d'une feuille modale : Annuler à gauche, titre au centre, action principale à droite.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, size } from '@/theme/tokens';
import { BAR_MAX_SCALE } from '@/theme/typography';

type Action = { label: string; onPress: () => void };

type Props = { title: string; cancel: Action; confirm: Action };

function HeaderButton({ action, strong }: { action: Action; strong?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={action.onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, strong && styles.strong]} maxFontSizeMultiplier={BAR_MAX_SCALE}>
        {action.label}
      </Text>
    </Pressable>
  );
}

export function ModalHeader({ title, cancel, confirm }: Props): React.JSX.Element {
  return (
    <View style={styles.header}>
      <HeaderButton action={cancel} />
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1} maxFontSizeMultiplier={BAR_MAX_SCALE}>
        {title}
      </Text>
      <HeaderButton action={confirm} strong />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.background,
  },
  title: {
    flexShrink: 1,
    fontFamily: font.semiBold,
    fontSize: font.size.title,
    color: colors.text,
    textAlign: 'center',
  },
  button: { minHeight: size.touch, minWidth: size.touch, paddingHorizontal: 10, justifyContent: 'center' },
  pressed: { opacity: 0.5 },
  buttonText: { fontFamily: font.medium, fontSize: font.size.title, color: colors.text },
  strong: { fontFamily: font.semiBold },
});
