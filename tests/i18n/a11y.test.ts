// Assemblage des libellés d'accessibilité à partir de propositions complètes.
import { t } from 'i18next';
import '@/i18n';
import { joinA11y } from '@/i18n/a11y';

test('joinA11y joint par une virgule et ignore les valeurs vides', () => {
  expect(joinA11y(['a', null, 'b', undefined, false, '', '  ', 'c'])).toBe('a, b, c');
  expect(joinA11y([])).toBe('');
});

test('une ligne de liste se reconstitue en phrase complète', () => {
  const when = t('list.row.when', { day: 'samedi 24 octobre', time: t('time.hm', { h: 10, m: '00' }) });
  expect(joinA11y(['Atelier réparation de vélos', when, 'Parc Barbieux, Roubaix', t('list.row.participating')])).toBe(
    'Atelier réparation de vélos, samedi 24 octobre à 10h00, Parc Barbieux, Roubaix, tu participes',
  );
});

test('le bandeau de la semaine et le jour du calendrier se construisent par propositions', () => {
  expect(
    joinA11y([
      t('list.weekStrip.period', { from: '19 octobre', to: '25 octobre' }),
      t('list.weekStrip.event', { count: 2, day: 'samedi' }),
      t('list.weekStrip.youParticipate'),
    ]),
  ).toBe('Cette semaine, du 19 octobre au 25 octobre, 2 événements, tu participes');
  expect(joinA11y(['mardi 20', t('calendar.a11y.today'), t('calendar.a11y.events', { count: 1 })])).toBe(
    "mardi 20, aujourd'hui, un événement",
  );
});
