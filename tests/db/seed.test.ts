// Jeu de démo : insertion unique, dates locales, réinitialisation.
import { createTestDb } from '../helpers/testDb';
import { migrate } from '@/db/migrations';
import type { Db } from '@/db/connection';
import { seedIfEmpty, resetDemoData, type Hasher } from '@/db/seed';
import { usersRepo } from '@/data/users';
import { eventsRepo } from '@/data/events';
import { settingsRepo } from '@/data/settings';
import { addDays, formatTime, toDayKey } from '@/utils/dates';

const now = new Date(2026, 9, 19, 12, 0);
const hash: Hasher = async (p, s) => `${s}:${p}`;
let salts = 0;
const randomSalt = () => `salt${salts++}`;
let db: Db;

const count = async (table: string) =>
  (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`))?.n;

beforeEach(async () => {
  db = createTestDb();
  await migrate(db);
});

describe('seedIfEmpty', () => {
  it('insère 4 comptes, 10 événements et pose seeded_at', async () => {
    expect(await seedIfEmpty(db, now, hash, randomSalt)).toBe(true);
    expect(await count('users')).toBe(4);
    expect(await count('events')).toBe(10);
    expect(await settingsRepo.get(db, 'seeded_at')).toBe(now.toISOString());
  });

  it('hache le mot de passe de démo avec un sel propre à chaque compte', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    const marie = await usersRepo.findByEmail(db, 'marie.lefevre@exemple.fr');
    expect(marie?.passwordHash).toBe(`${marie?.salt}:demo2026`);
    const rows = await db.getAllAsync<{ salt: string }>('SELECT salt FROM users');
    expect(new Set(rows.map((r) => r.salt)).size).toBe(4);
  });

  it('place les événements aux bons jours et heures locales', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    const events = await eventsRepo.listAll(db, 0);
    const velos = events.find((e) => e.title === 'Atelier réparation de vélos');
    const start = new Date(velos?.startsAt ?? '');
    expect(toDayKey(start)).toBe(toDayKey(addDays(now, 5)));
    expect(formatTime(start)).toBe('10h00');
  });

  it('garde 9h30 locale pour J+12, après le changement d\'heure du 25 octobre', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    const events = await eventsRepo.listAll(db, 0);
    const heron = events.find((e) => e.title === 'Balade nature au lac du Héron');
    const start = new Date(heron?.startsAt ?? '');
    expect(toDayKey(start)).toBe(toDayKey(addDays(now, 12)));
    expect(formatTime(start)).toBe('9h30');
  });

  it('donne 4 événements à Marie, dont 2 à venir avec lieu sous 15 jours', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    const marie = await usersRepo.findByEmail(db, 'marie.lefevre@exemple.fr');
    expect(await usersRepo.countEventsByAuthor(db, marie?.id ?? 0)).toBe(4);
    const events = await eventsRepo.listAll(db, marie?.id ?? 0);
    const limit = addDays(now, 15);
    const soon = events.filter(
      (e) => e.authorId === marie?.id && e.location !== null && new Date(e.startsAt) > now && new Date(e.startsAt) < limit,
    );
    expect(soon).toHaveLength(2);
  });

  it('ne fait rien au second appel et conserve un compte créé entre-temps', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    await usersRepo.create(db, { name: 'Zoé', email: 'zoe@exemple.fr', passwordHash: 'h', salt: 's', now: now.toISOString() });
    expect(await seedIfEmpty(db, now, hash, randomSalt)).toBe(false);
    expect(await count('users')).toBe(5);
    expect(await count('events')).toBe(10);
  });
});

describe('resetDemoData', () => {
  it('efface un compte ajouté et la session, puis réinsère la démo', async () => {
    await seedIfEmpty(db, now, hash, randomSalt);
    const zoe = await usersRepo.create(db, { name: 'Zoé', email: 'zoe@exemple.fr', passwordHash: 'h', salt: 's', now: now.toISOString() });
    await eventsRepo.create(db, zoe.id, { title: 'Perso', description: '', startsAt: now.toISOString(), location: null }, now.toISOString());
    await settingsRepo.set(db, 'session_user_id', String(zoe.id));
    await resetDemoData(db, now, hash, randomSalt);
    expect(await count('users')).toBe(4);
    expect(await count('events')).toBe(10);
    expect(await usersRepo.findByEmail(db, 'zoe@exemple.fr')).toBeNull();
    expect(await settingsRepo.get(db, 'session_user_id')).toBeNull();
    expect(await settingsRepo.get(db, 'seeded_at')).toBe(now.toISOString());
  });
});
