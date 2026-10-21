import { speechExcerpt } from '@/utils/text';

describe('speechExcerpt', () => {
  it('garde la première phrase', () => {
    expect(speechExcerpt('Tour du lac à pied, environ 6 km. On observe les oiseaux.')).toBe(
      'Tour du lac à pied, environ 6 km.',
    );
  });

  it('garde un texte sans ponctuation finale', () => {
    expect(speechExcerpt('Apéro de rentrée au local')).toBe('Apéro de rentrée au local');
  });

  it('coupe une phrase trop longue au dernier mot entier', () => {
    expect(speechExcerpt('On répare des vélos, des grille-pain et des lampes.', 30)).toBe('On répare des vélos, des…');
  });

  it('ignore les retours à la ligne et les espaces multiples', () => {
    expect(speechExcerpt('  Première ligne\n\nsuite.  Autre phrase.')).toBe('Première ligne suite.');
  });
});
