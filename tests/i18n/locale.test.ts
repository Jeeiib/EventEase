// getAppLocale : tag de l'appareil si sa langue est gérée, sinon fr-FR.
import { getLocales } from 'expo-localization';
import { getAppLocale } from '@/i18n';

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));
const mockedGetLocales = jest.mocked(getLocales);

function device(languageTag: string, languageCode: string) {
  mockedGetLocales.mockReturnValue([{ languageTag, languageCode }] as unknown as ReturnType<typeof getLocales>);
}

test('langue supportée : renvoie son tag', () => {
  device('fr-BE', 'fr');
  expect(getAppLocale()).toBe('fr-BE');
});

test('langue non supportée ou absente : renvoie fr-FR', () => {
  device('en-US', 'en');
  expect(getAppLocale()).toBe('fr-FR');
  mockedGetLocales.mockReturnValue([] as unknown as ReturnType<typeof getLocales>);
  expect(getAppLocale()).toBe('fr-FR');
});
