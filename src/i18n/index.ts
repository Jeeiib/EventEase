// Initialisation d'i18next et locale applicative pour le formatage des dates.
import 'intl-pluralrules'; // Hermes n'a pas Intl.PluralRules, que i18next exige pour les pluriels
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { fr } from './fr';

const SUPPORTED_LANGUAGES = ['fr'];
const DEFAULT_LOCALE = 'fr-FR';

// eslint-disable-next-line import/no-named-as-default-member -- un `use` nommé serait pris pour un hook React
void i18next.use(initReactI18next).init({
  resources: { fr },
  lng: 'fr',
  fallbackLng: 'fr',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false }, // React Native n'interprète pas le HTML
  returnNull: false,
});

export function getAppLocale(): string {
  const device = getLocales()[0];
  const language = device?.languageCode;
  return device?.languageTag && language && SUPPORTED_LANGUAGES.includes(language)
    ? device.languageTag
    : DEFAULT_LOCALE;
}
