// Validateurs de formulaires : ils renvoient des codes, l'écran les traduit.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

export type EventFormErrors = {
  title?: 'required';
  description?: 'required';
  startsAt?: 'required' | 'past';
};

export function validateName(v: string): 'required' | null {
  return v.trim() === '' ? 'required' : null;
}

export function validateEmail(v: string): 'required' | 'invalid' | null {
  const email = v.trim();
  if (email === '') return 'required';
  return EMAIL_PATTERN.test(email) ? null : 'invalid';
}

export function validatePassword(v: string): { code: 'tooShort'; missing: number } | null {
  return v.length < PASSWORD_MIN_LENGTH ? { code: 'tooShort', missing: PASSWORD_MIN_LENGTH - v.length } : null;
}

export function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

export function validateEventForm(
  values: { title: string; description: string; startsAt: string | null },
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
  return errors;
}
