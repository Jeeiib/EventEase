// Bouton à bascule de participation : son libellé dit ce que l'appui va faire, selon l'état et le temps.
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from './PrimaryButton';

type Props = { participating: boolean; past: boolean; loading: boolean; onPress: () => void };

export function ParticipationButton({ participating, past, loading, onPress }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const label = past
    ? participating
      ? t('event.unmarkAttended')
      : t('event.markAttended')
    : participating
      ? t('event.leave')
      : t('event.join');
  return (
    <PrimaryButton
      label={label}
      onPress={onPress}
      loading={loading}
      selected={participating}
      // Plein pour inviter à participer, contour une fois inscrit : l'action secondaire devient « se retirer ».
      variant={participating ? 'secondary' : 'primary'}
    />
  );
}
