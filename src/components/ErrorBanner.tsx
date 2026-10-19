// Bandeau d'erreur rouge pâle, pour une erreur qui ne concerne pas un seul champ.
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/theme/tokens';

export function ErrorBanner({ message }: { message: string }): React.JSX.Element {
  return (
    <View accessible accessibilityRole="alert" accessibilityLabel={message} style={styles.banner}>
      <Feather name="alert-circle" size={18} color={colors.dangerText} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: { marginTop: 2 },
  message: { flex: 1, fontFamily: font.regular, fontSize: font.size.row, lineHeight: 21, color: colors.dangerText },
});
