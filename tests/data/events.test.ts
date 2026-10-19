// Événements : lectures relatives au spectateur, écriture réservée à l'auteur, cascade.
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import type { EventInput } from '@/data/types';
import { usersRepo } from '@/data/users';
import { eventsRepo } from '@/data/events';
import { participationsRepo } from '@/data/participations';

const NOW = '2026-10-19T09:00:00.000Z';
const LATER = '2026-10-19T10:00:00.000Z';
const base: EventInput = { title: 'Concert', description: 'Salle comble', startsAt: '2026-11-01T18:00:00.000Z', location: null };
let db: Db;
let alice: number;
let bob: number;

const newUser = async (name: string) =>
  (await usersRepo.create(db, { name, email: `${name}@example.com`, passwordHash: 'h', salt: 's', now: NOW })).id;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  alice = await newUser('Alice');
  bob = await newUser('Bob');
});

describe('eventsRepo', () => {
  it('getById renvoie location null sans lieu, avec auteur et statut vierge', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    expect(await eventsRepo.getById(db, id, alice)).toEqual({
      id, ...base, location: null, authorId: alice, authorName: 'Alice',
      createdAt: NOW, updatedAt: NOW, participantCount: 0, isParticipating: false,
    });
  });

  it('getById renvoie le lieu complet quand il existe', async () => {
    const location = { label: 'Opéra', latitude: 45.76, longitude: 4.83 };
    const id = await eventsRepo.create(db, alice, { ...base, location }, NOW);
    expect((await eventsRepo.getById(db, id, alice))?.location).toEqual(location);
  });

  it('getById renvoie null si inconnu', async () => {
    expect(await eventsRepo.getById(db, 99, alice)).toBeNull();
  });

  it('le statut dépend du spectateur', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    await participationsRepo.toggle(db, bob, id, NOW);
    expect(await eventsRepo.getById(db, id, bob)).toMatchObject({ participantCount: 1, isParticipating: true });
    expect(await eventsRepo.getById(db, id, alice)).toMatchObject({ participantCount: 1, isParticipating: false });
  });

  it('listAll trie par starts_at croissant', async () => {
    const b = await eventsRepo.create(db, alice, { ...base, title: 'B', startsAt: '2026-12-01T10:00:00.000Z' }, NOW);
    const a = await eventsRepo.create(db, alice, { ...base, title: 'A', startsAt: '2026-11-01T10:00:00.000Z' }, NOW);
    expect((await eventsRepo.listAll(db, alice)).map((e) => e.id)).toEqual([a, b]);
  });

  it('listAll renvoie une ligne par événement avec le statut de chaque spectateur', async () => {
    const carol = await newUser('Carol');
    const first = await eventsRepo.create(db, alice, { ...base, title: 'A' }, NOW);
    const second = await eventsRepo.create(db, alice, { ...base, title: 'B' }, NOW);
    await participationsRepo.toggle(db, bob, first, NOW);
    await participationsRepo.toggle(db, carol, first, NOW);
    const asBob = await eventsRepo.listAll(db, bob);
    const asAlice = await eventsRepo.listAll(db, alice);
    expect(asBob.map((e) => [e.id, e.participantCount, e.isParticipating])).toEqual([[first, 2, true], [second, 0, false]]);
    expect(asAlice.map((e) => [e.id, e.participantCount, e.isParticipating])).toEqual([[first, 2, false], [second, 0, false]]);
  });

  it('update par l\'auteur change le contenu et updatedAt', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    const location = { label: 'Opéra', latitude: 45.76, longitude: 4.83 };
    expect(await eventsRepo.update(db, id, alice, { ...base, title: 'Nouveau', location }, LATER)).toBe(true);
    expect(await eventsRepo.getById(db, id, alice)).toMatchObject({
      title: 'Nouveau', location, createdAt: NOW, updatedAt: LATER,
    });
  });

  it('update efface le lieu quand l\'input n\'en a plus', async () => {
    const id = await eventsRepo.create(db, alice, { ...base, location: { label: 'X', latitude: 1, longitude: 2 } }, NOW);
    await eventsRepo.update(db, id, alice, base, LATER);
    expect((await eventsRepo.getById(db, id, alice))?.location).toBeNull();
  });

  it('un autre utilisateur ne peut pas modifier', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    expect(await eventsRepo.update(db, id, bob, { ...base, title: 'Piraté' }, LATER)).toBe(false);
    expect(await eventsRepo.getById(db, id, alice)).toMatchObject({ title: 'Concert', updatedAt: NOW });
  });

  it('un autre utilisateur ne peut pas supprimer', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    expect(await eventsRepo.remove(db, id, bob)).toBe(false);
    expect(await eventsRepo.getById(db, id, alice)).not.toBeNull();
  });

  it('remove par l\'auteur supprime l\'événement et ses participations', async () => {
    const id = await eventsRepo.create(db, alice, base, NOW);
    await participationsRepo.toggle(db, bob, id, NOW);
    expect(await participationsRepo.countByUser(db, bob)).toBe(1);
    expect(await eventsRepo.remove(db, id, alice)).toBe(true);
    expect(await eventsRepo.getById(db, id, alice)).toBeNull();
    const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM participations WHERE event_id = ?', id);
    expect(row?.n).toBe(0);
    expect(await participationsRepo.countByUser(db, bob)).toBe(0);
  });
});
