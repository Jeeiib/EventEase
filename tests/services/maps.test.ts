// Lien d'ouverture d'un lieu dans l'app de cartes, selon la plateforme.
import { mapsUrl } from '@/services/maps';

const parc = { label: 'Parc Barbieux, Roubaix', latitude: 50.677569, longitude: 3.1616 };

test('iOS : lien Plans avec la position et le nom du lieu', () => {
  expect(mapsUrl(parc, 'ios')).toBe('https://maps.apple.com/?ll=50.677569,3.1616&q=Parc%20Barbieux%2C%20Roubaix');
});

test('Android : intention geo: avec le nom du lieu en étiquette', () => {
  expect(mapsUrl(parc, 'android')).toBe('geo:50.677569,3.1616?q=50.677569,3.1616(Parc%20Barbieux%2C%20Roubaix)');
});
