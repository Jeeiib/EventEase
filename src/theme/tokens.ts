// Tokens du thème « Agenda », repris de la feuille de style des maquettes.
export const colors = {
  background: '#FFFFFF',
  text: '#000000',
  muted: '#6B6B6B',
  line: '#E6E6E6',
  border: '#8A8A8A',
  success: '#157F3D',
  danger: '#B42318',
  dangerBg: '#FDF0EF',
  dangerText: '#8A1A12',
  noteBg: '#F2F2F2',
  grabber: '#C7C7CC',
  spinnerTrack: '#D1D1D1',
  logoDot: '#22A55B',
} as const;

export const font = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  size: {
    h1: 34,
    h2: 22,
    month: 22,
    dayNumber: 30,
    title: 17,
    body: 16,
    row: 15,
    meta: 14,
    label: 14,
    small: 13,
    weekday: 12,
    tab: 11,
  },
  // React Native attend des points : les em de la feuille sont convertis avec la taille.
  letterSpacing: {
    h1: -1.0,
    month: -0.44,
    dayNumber: -0.9,
    title: -0.17,
  },
} as const;

export const size = {
  touch: 44,
  input: 52,
  button: 54,
  dayCell: 48,
  dayCircle: 34,
  avatar: 64,
  dateColumn: 52,
  weekDay: 44,
  dot: 7,
} as const;

export const radius = {
  input: 12,
  button: 14,
  chip: 22,
  sheet: 20,
  alert: 14,
} as const;

export const space = {
  screen: 20,
  authScreen: 24,
  rowGap: 14,
  fieldGap: 22,
  topInset: 62,
} as const;
