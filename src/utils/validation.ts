// Validateurs de formulaires : ils renvoient des codes, l'écran les traduit.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

/** Un code par champ fautif, absent si le champ est valide ; l'écran traduit les codes. */
export type EventFormErrors = {
  title?: 'required';
  description?: 'required';
  startsAt?: 'required' | 'past';
  place?: 'unresolved';
};

export function validateName(v: string): 'required' | null {
  return v.trim() === '' ? 'required' : null;
}

/** Contrôle de forme seulement (un `@` et un point) ; l'unicité est vérifiée à l'inscription. */
export function validateEmail(v: string): 'required' | 'invalid' | null {
  const email = v.trim();
  if (email === '') return 'required';
  return EMAIL_PATTERN.test(email) ? null : 'invalid';
}

/** Renvoie `tooShort` avec le nombre de caractères qui manquent (8 au minimum), ou `null`. */
export function validatePassword(v: string): { code: 'tooShort'; missing: number } | null {
  return v.length < PASSWORD_MIN_LENGTH ? { code: 'tooShort', missing: PASSWORD_MIN_LENGTH - v.length } : null;
}

export function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

/**
 * Valide le formulaire d'événement. `originalStartsAt` est la date avant modification : un événement
 * passé reste enregistrable tant qu'on ne change pas sa date. `placeResolved` dit qu'une suggestion a été choisie.
 */
export function validateEventForm(
  values: { title: string; description: string; startsAt: string | null; place?: string; placeResolved?: boolean },
  ctx: { now: Date; originalStartsAt: string | null },
): EventFormErrors {
  const errors: EventFormErrors = {};
  if (values.title.trim() === '') errors.title = 'required';
  if (values.description.trim() === '') errors.description = 'required';
  if (values.startsAt === null || Number.isNaN(Date.parse(values.startsAt))) {
    errors.startsAt = 'required';
  } else if (new Date(values.startsAt) <= ctx.now && values.startsAt !== ctx.originalStartsAt) {
    // Un événement passé reste modifiable tant qu'on ne touche pas à sa date.
    errors.startsAt = 'past';
  }
  // Un lieu tapé sans suggestion choisie n'a pas de position : ni météo ni distance possibles.
  if (values.place?.trim() && !values.placeResolved) errors.place = 'unresolved';
  return errors;
}
