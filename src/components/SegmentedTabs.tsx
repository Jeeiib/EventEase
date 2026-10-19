// Onglets texte soulignés (À venir / Passés), annoncés comme onglets par VoiceOver.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, size } from '@/theme/tokens';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({ options, value, onChange }: Props<T>): React.JSX.Element {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} maxFontSizeMultiplier={1.6}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 20 },
  tab: {
    minHeight: size.touch,
    justifyContent: 'center',
    // Bordure transparente quand inactif : le texte ne bouge pas en changeant d'onglet.
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: { borderBottomColor: colors.text },
  label: { fontFamily: font.medium, fontSize: font.size.row, color: colors.muted },
  labelSelected: { fontFamily: font.semiBold, color: colors.text },
});
