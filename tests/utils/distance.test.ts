// Distance à vol d'oiseau et son affichage.
import '@/i18n';
import { distanceMeters, formatDistance } from '@/utils/distance';

const paris = { latitude: 48.8566, longitude: 2.3522 };
const lille = { latitude: 50.6292, longitude: 3.0573 };

test('distanceMeters (haversine)', () => {
  const d = distanceMeters(paris, lille);
  expect(d).toBeGreaterThan(202_000);
  expect(d).toBeLessThan(205_000);
  expect(distanceMeters(paris, paris)).toBe(0);
  expect(distanceMeters(paris, lille)).toBeCloseTo(distanceMeters(lille, paris), 6);
});

// Intl fr sépare le nombre et l'unité par une espace fine insécable (U+202F).
test('formatDistance', () => {
  expect(formatDistance(650)).toBe('650\u202fm');
  expect(formatDistance(654)).toBe('650\u202fm');
  expect(formatDistance(996)).toBe('1\u202fkm');
  expect(formatDistance(1000)).toBe('1\u202fkm');
  expect(formatDistance(3140)).toBe('3,1\u202fkm');
  expect(formatDistance(21400)).toBe('21\u202fkm');
});
