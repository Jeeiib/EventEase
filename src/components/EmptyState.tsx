// État vide d'une liste : une icône, ce qui se passe, et l'action qui en sort.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, font } from '@/theme/tokens';
import { PrimaryButton } from './PrimaryButton';

type Icon = 'calendarAdd' | 'check' | 'clock';

type Props = {
  icon: Icon;
  title: string;
  text: string;
  action?: { label: string; onPress: () => void; variant: 'primary' | 'secondary' };
};

function EmptyIcon({ icon }: { icon: Icon }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {icon === 'calendarAdd' && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={2} />
          <Path d="M3 10h18M8 3v4M16 3v4M12 13.5v4M10 15.5h4" />
        </>
      )}
      {icon === 'check' && (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M8 12.5l2.8 2.8L16.5 9.5" />
        </>
      )}
      {icon === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7v5l3 2" />
        </>
      )}
    </Svg>
  );
}

export function EmptyState({ icon, title, text, action }: Props): React.JSX.Element {
  return (
    // Défilant : aux grandes tailles de texte, l'état vide peut dépasser l'écran.
    <ScrollView style={styles.scroll} contentContainerStyle={styles.empty}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <EmptyIcon icon={icon} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.text}>{text}</Text>
      {action && (
        <View style={styles.action}>
          <PrimaryButton label={action.label} onPress={action.onPress} variant={action.variant} compact />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 14,
    marginHorizontal: 20,
    paddingHorizontal: 8,
    paddingTop: 24,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  title: { fontFamily: font.semiBold, fontSize: font.size.h2, letterSpacing: -0.44, lineHeight: 28, color: colors.text },
  text: { fontFamily: font.regular, fontSize: font.size.body, lineHeight: 24, color: colors.muted },
  action: { marginTop: 6 },
});
