// Formulaire de création et de modification d'un événement, présenté en feuille modale.
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  findNodeHandle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthContext';
import { DateField } from '@/components/DateField';
import { DateTimeSheet } from '@/components/DateTimeSheet';
import { ModalHeader } from '@/components/ModalHeader';
import { PlaceField } from '@/components/PlaceField';
import { TextField } from '@/components/TextField';
import { eventsRepo } from '@/data/events';
import type { EventLocation, EventWithStatus } from '@/data/types';
import { useDb } from '@/db/DbContext';
import type { RootStackParamList } from '@/navigation/types';
import { colors, space } from '@/theme/tokens';
import { formatDayWithTime } from '@/utils/dates';
import { validateEventForm, type EventFormErrors } from '@/utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'EventForm'>;
type Values = { title: string; description: string; startsAt: string | null; place: string };
type Field = keyof EventFormErrors;

const FIELD_ORDER: Field[] = ['title', 'description', 'startsAt', 'place'];
const STEP_MS = 5 * 60 * 1000;

// Le sélecteur avance par 5 minutes : on part du prochain créneau rond.
function nextSlot(from: Date): Date {
  return new Date(Math.ceil(from.getTime() / STEP_MS) * STEP_MS);
}

export function EventFormScreen({ navigation, route }: Props): React.JSX.Element | null {
  const { t } = useTranslation();
  const db = useDb();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const eventId = route.params.eventId;
  // Modification : on attend l'événement avant de monter le formulaire, pour partir des bonnes valeurs.
  const [original, setOriginal] = useState<EventWithStatus | null | undefined>(eventId ? undefined : null);

  useEffect(() => {
    if (!eventId || userId === null) return;
    let cancelled = false;
    eventsRepo.getById(db, eventId, userId).then(
      (event) => {
        if (cancelled) return;
        // Supprimé entre-temps : on ne bascule surtout pas en création, on referme.
        if (event) setOriginal(event);
        else navigation.goBack();
      },
      () => {
        if (cancelled) return;
        Alert.alert(t('common.unexpectedError'));
        navigation.goBack();
      },
    );
    return () => {
      cancelled = true;
    };
  }, [db, eventId, userId, navigation, t]);

  if (original === undefined) return null;
  return <EventForm original={original} navigation={navigation} />;
}

function EventForm({ original, navigation }: { original: EventWithStatus | null; navigation: Props['navigation'] }) {
  const { t } = useTranslation();
  const db = useDb();
  const { user } = useAuth();
  const editing = original !== null;

  const [initial] = useState<Values>(() => ({
    title: original?.title ?? '',
    description: original?.description ?? '',
    startsAt: original?.startsAt ?? null,
    place: original?.location?.label ?? '',
  }));
  const [values, setValues] = useState<Values>(initial);
  // Le lieu choisi parmi les suggestions, avec sa position ; le texte seul ne suffit pas.
  const [location, setLocation] = useState<EventLocation | null>(original?.location ?? null);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [picker, setPicker] = useState<{ open: boolean; key: number }>({ open: false, key: 0 });
  const [focusRequest, setFocusRequest] = useState<{ field: Field } | null>(null);
  const saving = useRef(false);
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const placeRef = useRef<TextInput>(null);
  const dateRef = useRef<View>(null);

  const isDirty =
    values.title !== initial.title ||
    values.description !== initial.description ||
    values.startsAt !== initial.startsAt ||
    values.place !== initial.place ||
    location?.label !== original?.location?.label;

  // Annuler ou glisser la feuille avec des modifications : on demande avant de tout perdre.
  usePreventRemove(isDirty && !saved, ({ data }) => {
    Alert.alert(t('form.discard.title'), undefined, [
      { text: t('form.discard.cancel'), style: 'cancel' },
      { text: t('form.discard.confirm'), style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  // Fermeture une fois l'enregistrement rendu : la garde ci-dessus est alors levée.
  useEffect(() => {
    if (saved) navigation.goBack();
  }, [saved, navigation]);

  // Le focus va sur le premier champ fautif une fois l'erreur affichée : son libellé la contient déjà.
  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest.field === 'startsAt') {
      const node = findNodeHandle(dateRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    } else {
      const refs = { title: titleRef, description: descriptionRef, place: placeRef };
      refs[focusRequest.field].current?.focus();
    }
  }, [focusRequest]);

  function check(next: Values, place: EventLocation | null): EventFormErrors {
    return validateEventForm(
      { ...next, placeResolved: place !== null && place.label === next.place },
      { now: new Date(), originalStartsAt: original?.startsAt ?? null },
    );
  }

  function change(patch: Partial<Values>, place: EventLocation | null = location) {
    const next = { ...values, ...patch };
    // Retaper le lieu après un choix : l'ancienne position ne correspond plus au texte.
    const kept = place && place.label === next.place ? place : null;
    setValues(next);
    setLocation(kept);
    // Après une première tentative, les erreurs suivent la saisie au lieu d'attendre le prochain envoi.
    if (submitted) setErrors(check(next, kept));
  }

  async function submit() {
    if (saving.current || saved || !user) return;
    setSubmitted(true);
    const found = check(values, location);
    setErrors(found);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      setFocusRequest({ field: first });
      return;
    }
    saving.current = true;
    const input = {
      title: values.title.trim(),
      description: values.description.trim(),
      startsAt: values.startsAt as string,
      location: values.place.trim() ? location : null,
    };
    const now = new Date().toISOString();
    try {
      if (original) await eventsRepo.update(db, original.id, user.id, input, now);
      else await eventsRepo.create(db, user.id, input, now);
      setSaved(true);
    } catch {
      Alert.alert(t('common.unexpectedError'));
    } finally {
      saving.current = false;
    }
  }

  const minimumDate = editing ? undefined : nextSlot(new Date());
  const pickerStart = values.startsAt ? new Date(values.startsAt) : nextSlot(new Date());

  function openPicker() {
    if (Platform.OS === 'android') {
      // Android n'a pas de roue date + heure : deux dialogues, la date puis l'heure.
      DateTimePickerAndroid.open({
        value: pickerStart,
        mode: 'date',
        minimumDate,
        onChange: (event, date) => {
          if (event.type !== 'set' || !date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            is24Hour: true,
            minuteInterval: 5,
            onChange: (timeEvent, time) => {
              if (timeEvent.type === 'set' && time) change({ startsAt: time.toISOString() });
            },
          });
        },
      });
      return;
    }
    setPicker((p) => ({ open: true, key: p.key + 1 }));
  }

  const errorText = (field: Field) => {
    const code = errors[field];
    if (!code) return null;
    if (field === 'title') return t('form.errors.titleRequired');
    if (field === 'description') return t('form.errors.descriptionRequired');
    if (field === 'place') return t('form.errors.placeUnresolved');
    return code === 'past' ? t('form.errors.datePast') : t('form.errors.dateRequired');
  };

  return (
    <View style={styles.screen}>
      <ModalHeader
        title={editing ? t('form.editTitle') : t('form.createTitle')}
        cancel={{ label: t('common.cancel'), onPress: navigation.goBack }}
        confirm={{ label: editing ? t('form.save') : t('form.create'), onPress: submit }}
      />
      <ScrollView
        contentContainerStyle={styles.form}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <TextField
          ref={titleRef}
          label={t('form.title')}
          placeholder={t('form.titlePlaceholder')}
          value={values.title}
          onChangeText={(title) => change({ title })}
          error={errorText('title')}
          maxLength={80}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
        <TextField
          ref={descriptionRef}
          label={t('form.description')}
          placeholder={t('form.descriptionPlaceholder')}
          value={values.description}
          onChangeText={(description) => change({ description })}
          error={errorText('description')}
          maxLength={1000}
          tall
        />
        <DateField
          ref={dateRef}
          label={t('form.dateTime')}
          value={values.startsAt ? formatDayWithTime(new Date(values.startsAt), new Date()) : null}
          placeholder={t('form.choose')}
          error={errorText('startsAt')}
          onPress={openPicker}
        />
        <PlaceField
          ref={placeRef}
          value={values.place}
          chosen={location}
          error={errorText('place')}
          onChangeText={(place) => change({ place })}
          onChoose={(place) => change({ place: place.label }, place)}
          onClear={() => change({ place: '' }, null)}
        />
      </ScrollView>

      {Platform.OS === 'ios' && (
        <DateTimeSheet
          key={picker.key}
          visible={picker.open}
          initial={pickerStart}
          minimumDate={minimumDate}
          onCancel={() => setPicker((p) => ({ ...p, open: false }))}
          onConfirm={(date) => {
            setPicker((p) => ({ ...p, open: false }));
            change({ startsAt: date.toISOString() });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  form: { paddingTop: 20, paddingHorizontal: space.screen, paddingBottom: 40, gap: 22 },
});
