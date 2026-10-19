// Garde-fous de la ressource française : pluriels complets, clés du code existantes, formatage.
import fs from 'fs';
import path from 'path';
import { t } from 'i18next';
import '@/i18n';
import { fr } from '@/i18n/fr';

type Tree = { readonly [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[full] = value;
    else Object.assign(out, flatten(value, full));
  }
  return out;
}

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const flat = flatten(fr.translation);

test('chaque clé plurielle a ses deux formes et aucune valeur n est vide', () => {
  for (const [key, value] of Object.entries(flat)) {
    expect(value.trim()).not.toBe('');
    if (key.endsWith('_one')) expect(flat[key.replace(/_one$/, '_other')]).toBeDefined();
    if (key.endsWith('_other')) expect(flat[key.replace(/_other$/, '_one')]).toBeDefined();
  }
});

test('toute clé littérale t("...") du code existe dans fr', () => {
  const root = path.join(__dirname, '..', '..', 'src');
  const keys = new Set<string>();
  for (const file of sourceFiles(root)) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)) {
      keys.add(match[1]);
    }
  }
  for (const key of keys) {
    const exists = key in flat || `${key}_one` in flat || `${key}_other` in flat;
    expect({ key, exists }).toEqual({ key, exists: true });
  }
});

test('les pluriels et l interpolation fonctionnent', () => {
  expect(t('event.participants', { count: 1 })).toBe('1 participant');
  expect(t('event.participants', { count: 12 })).toBe('12 participants');
  expect(t('event.participantsWithYou', { count: 12 })).toBe('12 participants, dont toi');
  expect(t('list.deletedBanner', { title: 'Balade' })).toBe('« Balade » a été supprimé.');
  expect(t('time.hm', { h: 9, m: '30' })).toBe('9h30');
});
