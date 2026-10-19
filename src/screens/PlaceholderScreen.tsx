// Écran vide pour les routes pas encore construites ; chaque écran le remplace en arrivant.
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';

export function PlaceholderScreen(): React.JSX.Element {
  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
