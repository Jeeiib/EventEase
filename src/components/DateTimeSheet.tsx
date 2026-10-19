// Sélecteur de date et d'heure en feuille basse (iOS) : roues natives, Annuler / OK, résumé lisible dessous.
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getAppLocale } from '@/i18n';
import { colors, font, radius, size } from '@/theme/tokens';
import { formatDayLong, formatTime } from '@/utils/dates';

const STEP_MS = 5 * 60 * 1000;
const OPEN_MS = 300;
const CLOSE_MS = 220;

type Props = {
  visible: boolean;
  initial: Date;
  minimumDate?: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function DateTimeSheet({ visible, initial, minimumDate, onCancel, onConfirm }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Brouillon local : rien n'est appliqué tant qu'on n'a pas touché OK. Le parent remonte la feuille
  // (clé) à chaque ouverture, donc le brouillon repart toujours de la valeur du champ.
  // La roue avance par 5 minutes : une heure d'origine hors grille (9h07) est ramenée sur la roue.
  const [draft, setDraft] = useState(() => new Date(Math.round(initial.getTime() / STEP_MS) * STEP_MS));
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);
  const closing = useRef(false);

  // Le voile apparaît en fondu et seule la feuille glisse, comme une feuille iOS ;
  // avec « Réduire les animations », la feuille apparaît en fondu, sans glissement.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
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

  // On rejoue l'animation à l'envers avant de prévenir le parent, qui démonte la feuille.
  function close(after: () => void) {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => after());
  }

  const sheetMotion = reduceMotion
    ? { opacity: progress }
    : { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close(onCancel)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onCancel)} accessible={false} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) }, sheetMotion]}
        accessibilityViewIsModal
      >
        <View style={styles.header}>
          <SheetButton label={t('common.cancel')} onPress={() => close(onCancel)} />
          <Text style={styles.title} accessibilityRole="header">
            {t('form.dateTime')}
          </Text>
          <SheetButton label={t('common.ok')} onPress={() => close(() => onConfirm(draft))} strong />
        </View>
        <DateTimePicker
          value={draft}
          mode="datetime"
          display="spinner"
          minuteInterval={5}
          minimumDate={minimumDate}
          locale={getAppLocale()}
          textColor={colors.text}
          onChange={(_, date) => date && setDraft(date)}
        />
        <Text style={styles.summary}>
          {t('form.pickerSummary', { day: formatDayLong(draft, new Date()), time: formatTime(draft) })}
        </Text>
      </Animated.View>
    </Modal>
  );
}

function SheetButton({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, strong && styles.strong]}>{label}</Text>
    </Pressable>
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
    paddingTop: 6,
    paddingHorizontal: 8,
    gap: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  title: { fontFamily: font.semiBold, fontSize: font.size.title, color: colors.text },
  button: { minHeight: size.touch, minWidth: size.touch, paddingHorizontal: 14, justifyContent: 'center' },
  pressed: { opacity: 0.5 },
  buttonText: { fontFamily: font.medium, fontSize: font.size.title, color: colors.text },
  strong: { fontFamily: font.semiBold },
  summary: {
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: font.size.meta,
    color: colors.muted,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});
