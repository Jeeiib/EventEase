// Mise en forme de textes saisis par les utilisateurs.

/**
 * Début d'un texte, à lire par VoiceOver dans une ligne de liste : la première phrase, coupée
 * au dernier mot avant `max` caractères si elle est plus longue. Le texte complet reste sur la fiche.
 */
export function speechExcerpt(text: string, max = 120): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  const sentence = clean.match(/^.+?[.!?…](?=\s|$)/)?.[0] ?? clean;
  if (sentence.length <= max) return sentence;
  const cut = sentence.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:]+$/, '')}…`;
}
