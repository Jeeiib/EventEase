// Logo « Lignes » : trois traits d'agenda et le point vert de la participation.
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type Props = { size: number; accessibilityLabel?: string };

export function Logo({ size, accessibilityLabel }: Props): React.JSX.Element {
  // Sans libellé, le logo est décoratif : le nom de l'app est écrit à côté.
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" {...a11y}>
      <Rect width={100} height={100} rx={22.5} fill={colors.text} />
      <Rect x={25} y={22} width={12} height={56} rx={6} fill={colors.background} />
      <Rect x={25} y={22} width={50} height={12} rx={6} fill={colors.background} />
      <Rect x={25} y={44} width={28} height={12} rx={6} fill={colors.background} />
      <Rect x={25} y={66} width={50} height={12} rx={6} fill={colors.background} />
      <Circle cx={66} cy={50} r={7.5} fill={colors.logoDot} />
    </Svg>
  );
}
