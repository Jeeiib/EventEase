// Étiquette d'état au-dessus du titre d'une fiche (j'organise, je participe, terminé).
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/theme/tokens';

type Props = {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tone: 'success' | 'muted';
};

export function StatusTag({ label, icon, tone }: Props): React.JSX.Element {
  const color = tone === 'success' ? colors.success : colors.muted;
  return (
    <View style={styles.tag} accessible accessibilityLabel={label}>
      <Feather name={icon} size={16} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: font.medium, fontSize: font.size.row },
});
