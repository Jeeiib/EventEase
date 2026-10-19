// Gabarit des écrans de connexion et d'inscription : contenu défilant, invite en bas.
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { TextLink } from './TextLink';

type Props = {
  children: ReactNode;
  // Bloc posé au-dessus du titre (logo, ou bouton retour).
  top: ReactNode;
  footerText: string;
  footerAction: string;
  onFooterPress: () => void;
};

export function AuthLayout({
  children,
  top,
  footerText,
  footerAction,
  onFooterPress,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      // iOS décale lui-même le contenu sous le clavier et garde le champ actif visible.
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 8 },
      ]}
      keyboardShouldPersistTaps='handled'
      keyboardDismissMode='interactive'
    >
      {top}
      <View style={styles.body}>{children}</View>
      <View style={styles.footer}>
        <Text style={text.footer}>{footerText}</Text>
        <TextLink label={footerAction} onPress={onFooterPress} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  body: { flex: 1, paddingHorizontal: space.authScreen },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: space.authScreen,
    paddingTop: 24,
  },
});
