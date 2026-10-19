// Assemble un libellé d'accessibilité à partir de propositions complètes, séparées par des virgules.
export function joinA11y(parts: (string | null | undefined | false)[]): string {
  return parts.filter((part): part is string => typeof part === 'string' && part.trim() !== '').join(', ');
}
