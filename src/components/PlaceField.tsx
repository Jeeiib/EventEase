// Champ Lieu avec suggestions d'adresses pendant la frappe. Seul le toucher d'une suggestion fixe le lieu :
// rien n'est choisi à la place de l'utilisateur.
import { Feather } from '@expo/vector-icons';
import type { Ref } from 'react';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ASSOCIATION_AREA } from '@/config';
import type { EventLocation } from '@/data/types';
import { joinA11y } from '@/i18n/a11y';
import { searchAddress, type AddressHit } from '@/services/geocoding';
import { colors, font, size } from '@/theme/tokens';
import { text } from '@/theme/typography';
import { TextField } from './TextField';
import { TextLink } from './TextLink';

const MIN_LENGTH = 3;
const PAUSE_MS = 350;
// Nombre de suggestions affichées sous le champ ; le service en demande cinq et peut en renvoyer moins après dédoublonnage.
const MAX_SHOWN = 4;

// La liste précédente ne reste affichée que si l'on affine la même recherche.
const related = (a: string, b: string) => a.startsWith(b) || b.startsWith(a);

type Search = { query: string; status: 'searching' | 'done' | 'offline' | 'unavailable'; hits: AddressHit[] };

type Props = {
  value: string;
  chosen: EventLocation | null;
  onChangeText: (text: string) => void;
  onChoose: (location: EventLocation) => void;
  onClear: () => void;
  error?: string | null;
  ref?: Ref<TextInput>;
};

export function PlaceField({ value, chosen, onChangeText, onChoose, onClear, error, ref }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState<Search | null>(null);
  const query = value.trim();
  const isChosen = chosen !== null && chosen.label === value;
  const active = focused && !isChosen && query.length >= MIN_LENGTH;

  // Une pause dans la frappe lance la recherche ; une nouvelle frappe annule celle en vol.
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearch((s) => ({ query, status: 'searching', hits: s && related(s.query, query) ? s.hits : [] }));
      searchAddress(query, { near: ASSOCIATION_AREA, signal: controller.signal }).then((result) => {
        if (controller.signal.aborted) return;
        if (!result.ok) {
          const offline = result.error === 'network';
          setSearch({ query, status: offline ? 'offline' : 'unavailable', hits: [] });
          AccessibilityInfo.announceForAccessibility(offline ? t('form.place.offline') : t('form.locationError'));
          return;
        }
        const hits = result.hits.slice(0, MAX_SHOWN);
        setSearch({ query, status: 'done', hits });
        // Le focus reste dans le champ : sans annonce, VoiceOver ne saurait pas que la liste a changé.
        AccessibilityInfo.announceForAccessibility(
          hits.length > 0 ? t('form.place.count', { count: hits.length }) : t('form.place.none', { query }),
        );
      });
    }, PAUSE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, query, t]);

  function choose(hit: AddressHit) {
    Keyboard.dismiss();
    onChoose({ label: hit.label, latitude: hit.latitude, longitude: hit.longitude });
    AccessibilityInfo.announceForAccessibility(t('form.place.chosen', { label: hit.label }));
  }

  // Les messages ne parlent que de la saisie en cours ; la liste précédente reste affichée pendant qu'on affine.
  const current = active && search?.query === query ? search : null;
  const searching = active && (!current || current.status === 'searching');
  const hits = active && search && related(search.query, query) ? search.hits : [];

  const clear = value !== '' && (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('form.removeLocation')}
      onPress={onClear}
      style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
    >
      <View style={styles.clearDisc}>
        <Feather name="x" size={13} color={colors.background} />
      </View>
    </Pressable>
  );

  return (
    <View>
      <TextField
        ref={ref}
        label={t('form.location')}
        optional={t('common.optional')}
        placeholder={t('form.locationPlaceholder')}
        hint={!value && !error ? t('form.locationHint') : undefined}
        error={error}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessory={clear || undefined}
        autoCorrect={false}
        returnKeyType="done"
      />

      {!!error && (
        <View style={styles.remove}>
          <TextLink label={t('form.removeLocation')} onPress={onClear} />
        </View>
      )}

      {isChosen && !error && <Status icon="check" message={t('form.place.found')} />}

      {hits.length > 0 && (
        <View style={styles.list}>
          {hits.map((hit, i) => (
            <Pressable
              key={hit.label}
              accessibilityRole="button"
              accessibilityLabel={joinA11y([hit.name, hit.place])}
              onPress={() => choose(hit)}
              style={({ pressed }) => [styles.hit, i === hits.length - 1 && styles.lastHit, pressed && styles.pressed]}
            >
              <Feather name="map-pin" size={18} color={colors.muted} style={styles.pin} />
              <View style={styles.hitText} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                <Text style={styles.hitName}>{hit.name}</Text>
                <Text style={styles.hitPlace}>{hit.place}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={[text.hint, styles.credit]}>{t('form.place.credit')}</Text>
        </View>
      )}

      {searching && hits.length === 0 && <Status spinner message={t('form.locationSearching')} />}
      {current?.status === 'done' && current.hits.length === 0 && (
        <Status icon="search" message={t('form.place.none', { query })} />
      )}
      {current?.status === 'offline' && <Status icon="wifi-off" message={t('form.place.offline')} />}
      {current?.status === 'unavailable' && <Status icon="alert-circle" message={t('form.locationError')} />}
    </View>
  );
}

// Message sous le champ : un statut, pas une erreur. Les résultats et les échecs sont aussi annoncés à VoiceOver.
function Status({
  icon,
  spinner = false,
  message,
}: {
  icon?: React.ComponentProps<typeof Feather>['name'];
  spinner?: boolean;
  message: string;
}) {
  return (
    <View style={styles.status}>
      <View style={styles.statusIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {spinner ? (
          <ActivityIndicator size="small" color={colors.muted} />
        ) : (
          icon && <Feather name={icon} size={16} color={colors.text} />
        )}
      </View>
      <Text style={styles.statusText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clear: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  clearDisc: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  remove: { marginTop: 4, alignSelf: 'flex-start' },
  list: { marginTop: 10 },
  hit: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  lastHit: { borderBottomWidth: 1, borderBottomColor: colors.line },
  pin: { marginTop: 2 },
  hitText: { flex: 1, gap: 2 },
  hitName: { fontFamily: font.medium, fontSize: font.size.body, color: colors.text },
  hitPlace: { fontFamily: font.regular, fontSize: font.size.meta, color: colors.muted },
  credit: { marginTop: 10 },
  status: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 12 },
  statusIcon: { width: 16, minHeight: 18, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  statusText: { flex: 1, fontFamily: font.regular, fontSize: font.size.meta, lineHeight: 19, color: colors.text },
});
