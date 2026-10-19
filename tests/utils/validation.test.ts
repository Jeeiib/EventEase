// Les validateurs renvoient des codes, jamais des phrases.
import {
  normalizeEmail,
  validateEmail,
  validateEventForm,
  validateName,
  validatePassword,
} from '@/utils/validation';

const now = new Date('2026-10-19T12:00:00.000Z');
const past = '2026-10-17T08:00:00.000Z';
const future = '2026-10-25T08:00:00.000Z';

test('validateName', () => {
  expect(validateName('')).toBe('required');
  expect(validateName('   ')).toBe('required');
  expect(validateName('Marie')).toBeNull();
});

test('validateEmail', () => {
  expect(validateEmail(' Marie@Exemple.fr ')).toBeNull();
  expect(validateEmail('marie@exemple')).toBe('invalid');
  expect(validateEmail('')).toBe('required');
  expect(validateEmail('  ')).toBe('required');
});

test('normalizeEmail', () => {
  expect(normalizeEmail(' Marie@Exemple.FR ')).toBe('marie@exemple.fr');
});

test('validatePassword', () => {
  expect(validatePassword('vélo')).toEqual({ code: 'tooShort', missing: 4 });
  expect(validatePassword('')).toEqual({ code: 'tooShort', missing: 8 });
  expect(validatePassword('12345678')).toBeNull();
});

test('validateEventForm', () => {
  expect(validateEventForm({ title: '', description: 'x', startsAt: past }, { now, originalStartsAt: null })).toEqual({
    title: 'required',
    startsAt: 'past',
  });
  expect(validateEventForm({ title: 't', description: ' ', startsAt: future }, { now, originalStartsAt: null })).toEqual({
    description: 'required',
  });
  expect(validateEventForm({ title: 't', description: 'd', startsAt: future }, { now, originalStartsAt: null })).toEqual({});
});

test('modifier un événement passé sans toucher la date est permis', () => {
  expect(validateEventForm({ title: 't', description: 'd', startsAt: past }, { now, originalStartsAt: past })).toEqual({});
  expect(
    validateEventForm({ title: 't', description: 'd', startsAt: past }, { now, originalStartsAt: '2026-10-16T08:00:00.000Z' }),
  ).toEqual({ startsAt: 'past' });
});

test('date absente', () => {
  expect(validateEventForm({ title: 't', description: 'd', startsAt: null }, { now, originalStartsAt: null })).toEqual({
    startsAt: 'required',
  });
});
