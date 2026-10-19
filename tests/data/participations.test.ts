// Participations : bascule, compteur par événement et par utilisateur.
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import { usersRepo } from '@/data/users';
import { eventsRepo } from '@/data/events';
import { participationsRepo } from '@/data/participations';

const NOW = '2026-10-19T09:00:00.000Z';
let db: Db;
let eventId: number;
let camille: number;
let hugo: number;

const newUser = async (name: string) =>
  (await usersRepo.create(db, { name, email: `${name}@exemple.fr`, passwordHash: 'h', salt: 's', now: NOW })).id;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  camille = await newUser('camille');
  hugo = await newUser('hugo');
  eventId = await eventsRepo.create(
    db,
    camille,
    { title: 'T', description: 'D', startsAt: '2026-11-01T10:00:00.000Z', location: null },
    NOW,
  );
});

describe('participationsRepo', () => {
  it('toggle inscrit puis désinscrit', async () => {
    expect(await participationsRepo.toggle(db, camille, eventId, NOW)).toEqual({ isParticipating: true, participantCount: 1 });
    expect(await participationsRepo.toggle(db, camille, eventId, NOW)).toEqual({ isParticipating: false, participantCount: 0 });
  });

  it('compte deux participants', async () => {
    await participationsRepo.toggle(db, camille, eventId, NOW);
    expect(await participationsRepo.toggle(db, hugo, eventId, NOW)).toEqual({ isParticipating: true, participantCount: 2 });
  });

  it('countByUser suit les bascules', async () => {
    expect(await participationsRepo.countByUser(db, camille)).toBe(0);
    await participationsRepo.toggle(db, camille, eventId, NOW);
    expect(await participationsRepo.countByUser(db, camille)).toBe(1);
    await participationsRepo.toggle(db, camille, eventId, NOW);
    expect(await participationsRepo.countByUser(db, camille)).toBe(0);
  });
});
