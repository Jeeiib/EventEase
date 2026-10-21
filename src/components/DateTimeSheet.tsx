// Sélecteur de date et d'heure en feuille basse (iOS) : roues natives, Annuler / OK, résumé lisible dessous.
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAppLocale } from '@/i18n';
import { colors, font, size } from '@/theme/tokens';
import { formatDayLong, formatTime, STEP_MS } from '@/utils/dates';
import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  initial: Date;
  minimumDate?: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function DateTimeSheet({ visible, initial, minimumDate, onCancel, onConfirm }: Props): React.JSX.Element {
  const { t } = useTranslation();
  // Brouillon local : rien n'est appliqué tant qu'on n'a pas touché OK. Le parent remonte la feuille
  // (clé) à chaque ouverture, donc le brouillon repart toujours de la valeur du champ.
  // La roue avance par 5 minutes : une heure d'origine hors grille (9h07) est ramenée sur la roue.
  const [draft, setDraft] = useState(() => new Date(Math.round(initial.getTime() / STEP_MS) * STEP_MS));

  return (
    <BottomSheet visible={visible} onDismiss={onCancel} style={styles.sheet}>
      {(close) => (
        <>
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
        </>
      )}
    </BottomSheet>
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
  sheet: { paddingTop: 6, paddingHorizontal: 8, gap: 6 },
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
