// Ligne d'information d'une fiche : icône, texte principal et sous-ligne, lus comme un seul élément.
import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { joinA11y } from '@/i18n/a11y';
import { colors, font } from '@/theme/tokens';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  /** Icône hors de Feather (météo « éclaircies »), à la place de `icon`. */
  iconElement?: ReactNode;
  /** Information pas encore disponible : titre en gris. */
  muted?: boolean;
  busy?: boolean;
  title: string;
  subtitle?: string;
  /** Dernière ligne du bloc : ajoute le filet du bas. */
  last?: boolean;
  /** Boutons de la ligne (distance, météo) : frères du bloc lu, jamais ses enfants. */
  children?: ReactNode;
};

export function InfoRow({
  icon,
  iconElement,
  title,
  subtitle,
  muted = false,
  busy = false,
  last = false,
  children,
}: Props): React.JSX.Element {
  return (
    <View style={[styles.row, last && styles.last]}>
      {/* L'icône est une police : sans ça, VoiceOver s'arrête sur un glyphe muet. */}
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.icon}>
        {iconElement ?? <Feather name={icon} size={20} color={colors.text} />}
      </View>
      <View style={styles.texts}>
        <View accessible accessibilityLabel={joinA11y([title, subtitle])} accessibilityState={{ busy }}>
          <Text style={[styles.title, muted && styles.muted]}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  last: { borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { marginTop: 1 },
  texts: { flex: 1 },
  muted: { color: colors.muted },
  title: { fontFamily: font.medium, fontSize: font.size.row, lineHeight: 20, color: colors.text },
  subtitle: { fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 20, color: colors.muted, marginTop: 2 },
});
