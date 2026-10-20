// Ligne météo de la fiche : la prévision du jour J, une date d'ouverture si c'est trop loin, ou un échec sans gravité.
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { WeatherState } from '@/hooks/useWeather';
import type { WeatherKind } from '@/services/weather';
import { colors } from '@/theme/tokens';
import { formatDateOnly } from '@/utils/dates';
import { InfoRow } from './InfoRow';
import { InlineButton } from './InlineButton';

const ICONS: Record<Exclude<WeatherKind, 'partlyCloudy'>, React.ComponentProps<typeof Feather>['name']> = {
  clear: 'sun',
  overcast: 'cloud',
  fog: 'cloud',
  drizzle: 'cloud-drizzle',
  rain: 'cloud-rain',
  snow: 'cloud-snow',
  showers: 'cloud-rain',
  thunderstorm: 'cloud-lightning',
};

type Props = { weather: WeatherState; now: Date; onRetry: () => void; last?: boolean };

export function WeatherRow({ weather, now, onRetry, last }: Props): React.JSX.Element | null {
  const { t } = useTranslation();
  switch (weather.status) {
    case 'none':
      return null;
    case 'loading':
      return <InfoRow icon="cloud" title={t('weather.loading')} muted busy last={last} />;
    case 'tooFar':
      return (
        <InfoRow
          icon="cloud"
          title={t('weather.tooFar.title')}
          subtitle={t('weather.tooFar.text', { date: formatDateOnly(weather.availableFrom, now) })}
          muted
          last={last}
        />
      );
    case 'error':
      return (
        <InfoRow icon="cloud-off" title={t('weather.error.title')} subtitle={t('weather.error.text')} last={last}>
          <InlineButton label={t('common.retry')} onPress={onRetry} />
        </InfoRow>
      );
    case 'ready': {
      const { kind, tempMin, tempMax } = weather.forecast;
      // Feather n'a pas de soleil voilé : Ionicons le dessine dans le même trait.
      const iconElement =
        kind === 'partlyCloudy' ? <Ionicons name="partly-sunny-outline" size={21} color={colors.text} /> : undefined;
      return (
        <InfoRow
          icon={kind === 'partlyCloudy' ? 'cloud' : ICONS[kind]}
          iconElement={iconElement}
          title={t(`weather.kind.${kind}`)}
          subtitle={t('weather.range', { min: tempMin, max: tempMax })}
          last={last}
        />
      );
    }
  }
}
