// Composition des libellés d'accessibilité lus par VoiceOver.
/** Assemble un libellé d'accessibilité à partir de propositions complètes, séparées par des virgules ; ignore les parties vides ou fausses. */
export function joinA11y(parts: (string | null | undefined | false)[]): string {
  return parts.filter((part): part is string => typeof part === 'string' && part.trim() !== '').join(', ');
}
