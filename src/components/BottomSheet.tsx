// Feuille basse : le voile apparaît en fondu et seule la feuille glisse, comme une feuille iOS ;
// avec « Réduire les animations », la feuille apparaît en fondu, sans glissement.
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/theme/tokens';

const OPEN_MS = 300;
const CLOSE_MS = 220;

type Props = {
  visible: boolean;
  // Fermeture sans choix : voile touché, geste retour d'Android.
  onDismiss: () => void;
  // Reçoit close(après) : l'animation se rejoue à l'envers avant que le parent démonte la feuille.
  children: (close: (after: () => void) => void) => ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BottomSheet({ visible, onDismiss, children, style }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);
  // Verrou contre un second toucher pendant la fermeture, levé à chaque nouvelle ouverture.
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      setClosing(false);
      setReduceMotion(reduce);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [visible, progress]);

  function close(after: () => void) {
    if (closing) return;
    setClosing(true);
    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => after());
  }

  const motion = reduceMotion
    ? { opacity: progress }
    : { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close(onDismiss)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onDismiss)} accessible={false} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) }, style, motion]}
        accessibilityViewIsModal
        onAccessibilityEscape={() => close(onDismiss)}
      >
        {children(close)}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
});
