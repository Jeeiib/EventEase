// Accès aux comptes : création, lecture par e-mail et par id, compteur d'événements.
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import { usersRepo } from '@/data/users';
import { eventsRepo } from '@/data/events';

const NOW = '2026-10-19T09:00:00.000Z';
const input = { name: 'Camille', email: 'camille@exemple.fr', passwordHash: 'h', salt: 's', now: NOW };
const eventInput = { title: 'T', description: 'D', startsAt: '2026-11-01T10:00:00.000Z', location: null };

let db: Db;
beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('usersRepo', () => {
  it('create puis findByEmail renvoie le même id, avec hash et sel', async () => {
    const user = await usersRepo.create(db, input);
    expect(user).toEqual({ id: expect.any(Number), name: 'Camille', email: 'camille@exemple.fr', createdAt: NOW });
    const found = await usersRepo.findByEmail(db, 'camille@exemple.fr');
    expect(found).toEqual({ ...user, passwordHash: 'h', salt: 's' });
  });

  it('findByEmail et findById renvoient null si inconnu', async () => {
    expect(await usersRepo.findByEmail(db, 'x@exemple.fr')).toBeNull();
    expect(await usersRepo.findById(db, 42)).toBeNull();
  });

  it('findById ne renvoie ni hash ni sel', async () => {
    const user = await usersRepo.create(db, input);
    expect(await usersRepo.findById(db, user.id)).toEqual(user);
  });

  it('rejette un second compte avec le même e-mail', async () => {
    await usersRepo.create(db, input);
    await expect(usersRepo.create(db, { ...input, name: 'Autre' })).rejects.toThrow();
  });

  it('countEventsByAuthor passe de 0 à 2', async () => {
    const user = await usersRepo.create(db, input);
    expect(await usersRepo.countEventsByAuthor(db, user.id)).toBe(0);
    await eventsRepo.create(db, user.id, eventInput, NOW);
    await eventsRepo.create(db, user.id, eventInput, NOW);
    expect(await usersRepo.countEventsByAuthor(db, user.id)).toBe(2);
  });
});
