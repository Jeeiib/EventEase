// Les compteurs du profil et les listes qu'ils ouvrent lisent la base par deux chemins : ils doivent concorder.
import { createTestDb } from '../helpers/testDb';
import { eventsRepo } from '@/data/events';
import { participationsRepo } from '@/data/participations';
import { usersRepo } from '@/data/users';
import { migrate } from '@/db/migrations';
import { seedIfEmpty, type Hasher } from '@/db/seed';
import { selectProfileEvents } from '@/utils/eventGroups';
import { formatMonthShort } from '@/utils/dates';

const hash: Hasher = async (p, s) => `${s}:${p}`;

test('pour chaque compte de démo, le nombre affiché au profil égale le nombre de lignes de la liste', async () => {
  const db = createTestDb();
  await migrate(db);
  await seedIfEmpty(db, new Date(2026, 9, 19, 12, 0), hash, () => 'sel');
  const users = await db.getAllAsync<{ id: number }>('SELECT id FROM users');
  expect(users).toHaveLength(4);
  for (const { id } of users) {
    const all = await eventsRepo.listAll(db, id);
    expect(selectProfileEvents(all, 'created', id)).toHaveLength(await usersRepo.countEventsByAuthor(db, id));
    expect(selectProfileEvents(all, 'participations', id)).toHaveLength(await participationsRepo.countByUser(db, id));
  }
});

test('mois abrégé sous le numéro du jour', () => {
  expect(formatMonthShort(new Date(2026, 9, 24), 'fr-FR')).toBe('oct.');
  expect(formatMonthShort(new Date(2026, 10, 4), 'fr-FR')).toBe('nov.');
});
