// Message d'erreur ou d'aide sous un champ ; masqué à VoiceOver, qui le lit déjà dans le libellé du champ.
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/theme/tokens';
import { text } from '@/theme/typography';

export function FieldMessage({ error, hint }: { error?: string | null; hint?: string }): React.JSX.Element | null {
  if (error) {
    return (
      <View style={styles.message} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Feather name="alert-circle" size={16} color={colors.danger} style={styles.icon} />
        <Text style={[text.error, styles.text]}>{error}</Text>
      </View>
    );
  }
  if (!hint) return null;
  return (
    <Text style={[text.hint, styles.hint]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {hint}
    </Text>
  );
}

// Libellé visible au-dessus d'un champ, avec la mention « (facultatif) » en gris ; VoiceOver le lit via le champ.
export function FieldLabel({ label, optional }: { label: string; optional?: string }): React.JSX.Element {
  return (
    <Text style={[text.label, styles.label]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {label}
      {optional ? <Text style={styles.optional}> {optional}</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 8 },
  icon: { marginTop: 2 },
  text: { flex: 1 },
  hint: { marginTop: 8 },
  label: { marginBottom: 8 },
  optional: { fontFamily: font.regular, color: colors.muted },
});
