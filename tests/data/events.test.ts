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
let camille: number;
let hugo: number;

const newUser = async (name: string) =>
  (await usersRepo.create(db, { name, email: `${name}@exemple.fr`, passwordHash: 'h', salt: 's', now: NOW })).id;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
  camille = await newUser('Camille');
  hugo = await newUser('Hugo');
});

describe('eventsRepo', () => {
  it('getById renvoie location null sans lieu, avec auteur et statut vierge', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    expect(await eventsRepo.getById(db, id, camille)).toEqual({
      id, ...base, location: null, authorId: camille, authorName: 'Camille',
      createdAt: NOW, updatedAt: NOW, participantCount: 0, isParticipating: false,
    });
  });

  it('getById renvoie le lieu complet quand il existe', async () => {
    const location = { label: 'Opéra', latitude: 45.76, longitude: 4.83 };
    const id = await eventsRepo.create(db, camille, { ...base, location }, NOW);
    expect((await eventsRepo.getById(db, id, camille))?.location).toEqual(location);
  });

  it('getById renvoie null si inconnu', async () => {
    expect(await eventsRepo.getById(db, 99, camille)).toBeNull();
  });

  it('le statut dépend du spectateur', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    await participationsRepo.toggle(db, hugo, id, NOW);
    expect(await eventsRepo.getById(db, id, hugo)).toMatchObject({ participantCount: 1, isParticipating: true });
    expect(await eventsRepo.getById(db, id, camille)).toMatchObject({ participantCount: 1, isParticipating: false });
  });

  it('listAll trie par starts_at croissant', async () => {
    const b = await eventsRepo.create(db, camille, { ...base, title: 'B', startsAt: '2026-12-01T10:00:00.000Z' }, NOW);
    const a = await eventsRepo.create(db, camille, { ...base, title: 'A', startsAt: '2026-11-01T10:00:00.000Z' }, NOW);
    expect((await eventsRepo.listAll(db, camille)).map((e) => e.id)).toEqual([a, b]);
  });

  it('listAll renvoie une ligne par événement avec le statut de chaque spectateur', async () => {
    const lucie = await newUser('Lucie');
    const first = await eventsRepo.create(db, camille, { ...base, title: 'A' }, NOW);
    const second = await eventsRepo.create(db, camille, { ...base, title: 'B' }, NOW);
    await participationsRepo.toggle(db, hugo, first, NOW);
    await participationsRepo.toggle(db, lucie, first, NOW);
    const asHugo = await eventsRepo.listAll(db, hugo);
    const asCamille = await eventsRepo.listAll(db, camille);
    expect(asHugo.map((e) => [e.id, e.participantCount, e.isParticipating])).toEqual([[first, 2, true], [second, 0, false]]);
    expect(asCamille.map((e) => [e.id, e.participantCount, e.isParticipating])).toEqual([[first, 2, false], [second, 0, false]]);
  });

  it('update par l\'auteur change le contenu et updatedAt', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    const location = { label: 'Opéra', latitude: 45.76, longitude: 4.83 };
    expect(await eventsRepo.update(db, id, camille, { ...base, title: 'Nouveau', location }, LATER)).toBe(true);
    expect(await eventsRepo.getById(db, id, camille)).toMatchObject({
      title: 'Nouveau', location, createdAt: NOW, updatedAt: LATER,
    });
  });

  it('update efface le lieu quand l\'input n\'en a plus', async () => {
    const id = await eventsRepo.create(db, camille, { ...base, location: { label: 'X', latitude: 1, longitude: 2 } }, NOW);
    await eventsRepo.update(db, id, camille, base, LATER);
    expect((await eventsRepo.getById(db, id, camille))?.location).toBeNull();
  });

  it('un autre utilisateur ne peut pas modifier', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    expect(await eventsRepo.update(db, id, hugo, { ...base, title: 'Piraté' }, LATER)).toBe(false);
    expect(await eventsRepo.getById(db, id, camille)).toMatchObject({ title: 'Concert', updatedAt: NOW });
  });

  it('un autre utilisateur ne peut pas supprimer', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    expect(await eventsRepo.remove(db, id, hugo)).toBe(false);
    expect(await eventsRepo.getById(db, id, camille)).not.toBeNull();
  });

  it('remove par l\'auteur supprime l\'événement et ses participations', async () => {
    const id = await eventsRepo.create(db, camille, base, NOW);
    await participationsRepo.toggle(db, hugo, id, NOW);
    expect(await participationsRepo.countByUser(db, hugo)).toBe(1);
    expect(await eventsRepo.remove(db, id, camille)).toBe(true);
    expect(await eventsRepo.getById(db, id, camille)).toBeNull();
    const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM participations WHERE event_id = ?', id);
    expect(row?.n).toBe(0);
    expect(await participationsRepo.countByUser(db, hugo)).toBe(0);
  });
});
