// Initiales de l'avatar.
import { initials } from '@/components/Avatar';

test('prénom et nom : première lettre de chacun', () => {
  expect(initials('Marie Lefèvre')).toBe('ML');
});

test('nom composé : première et dernière parties', () => {
  expect(initials('  jean   paul  martin ')).toBe('JM');
});

test('un seul mot : une lettre', () => {
  expect(initials('Lucas')).toBe('L');
});

test('initiale accentuée en majuscule', () => {
  expect(initials('élodie durand')).toBe('ÉD');
});
