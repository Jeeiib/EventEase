// Styles de texte communs, pour que chaque écran reprenne la même échelle typographique.
import { StyleSheet } from 'react-native';
import { colors, font } from './tokens';

/** Plafond du grand titre aux tailles de texte d'accessibilité : comme les grands titres d'iOS, il grossit moins que le texte courant, sinon il déborde sur les boutons voisins. */
export const LARGE_TITLE_MAX_SCALE = 1.25;

export const text = StyleSheet.create({
  h1: {
    fontFamily: font.semiBold,
    fontSize: font.size.h1,
    // Assez haut pour les accents des capitales (« Événements ») : 36 les coupait.
    lineHeight: 42,
    letterSpacing: font.letterSpacing.h1,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: font.size.body,
    lineHeight: 23,
    color: colors.muted,
  },
  body: {
    fontFamily: font.regular,
    fontSize: font.size.body,
    lineHeight: 22,
    color: colors.text,
  },
  label: {
    fontFamily: font.medium,
    fontSize: font.size.label,
    lineHeight: 19,
    color: colors.text,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: font.size.small,
    lineHeight: 18,
    color: colors.muted,
  },
  error: {
    fontFamily: font.regular,
    fontSize: font.size.meta,
    lineHeight: 19,
    color: colors.danger,
  },
  footer: {
    fontFamily: font.regular,
    fontSize: font.size.row,
    lineHeight: 20,
    color: colors.muted,
  },
});
