// Pastille ronde avec les initiales ; décorative, le nom est écrit juste à côté.
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, size } from '@/theme/tokens';

// « Marie Lefèvre » donne « ML » ; un nom d'un seul mot donne sa première lettre.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return letters.map((w) => w.charAt(0).toLocaleUpperCase()).join('');
}

export function Avatar({ name }: { name: string }): React.JSX.Element {
  return (
    <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.text} maxFontSizeMultiplier={1.2}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: size.avatar,
    height: size.avatar,
    borderRadius: size.avatar / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: font.semiBold, fontSize: font.size.h2, letterSpacing: -0.44, color: colors.background },
});
