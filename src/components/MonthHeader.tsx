// Titre de mois dans la liste (« Octobre », « Janvier 2027 » si l'année change).
import { StyleSheet, Text } from 'react-native';
import { colors, font } from '@/theme/tokens';

export function MonthHeader({ label }: { label: string }): React.JSX.Element {
  return (
    <Text style={styles.month} accessibilityRole="header">
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  month: {
    paddingTop: 18,
    paddingBottom: 4,
    fontFamily: font.semiBold,
    fontSize: font.size.month,
    letterSpacing: font.letterSpacing.month,
    color: colors.text,
    backgroundColor: colors.background,
  },
});
