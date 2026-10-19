// Confirmation discrète après une suppression : annoncée à VoiceOver, elle s'efface seule.
import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/theme/tokens';

const VISIBLE_MS = 4000;

export function DeletedBanner({ message, onHide }: { message: string; onHide: () => void }): React.JSX.Element {
  useEffect(() => {
    // iOS n'a pas de région live : on annonce. Android lit la région live, une annonce ferait doublon.
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(onHide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  return (
    <View style={styles.note} accessible accessibilityLabel={message} accessibilityLiveRegion="polite">
      <Feather name="check" size={18} color={colors.text} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.noteBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
    marginHorizontal: 20,
  },
  text: { flex: 1, fontFamily: font.regular, fontSize: font.size.row, lineHeight: 20, color: colors.text },
});
