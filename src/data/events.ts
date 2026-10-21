// Accès à la table events ; les lectures sont relatives au spectateur (viewerId).
import type { Db, SqlValue } from '@/db/connection';
import type { EventInput, EventWithStatus } from './types';

type EventRow = {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  is_participating: number;
};

const SELECT_WITH_STATUS = `
  SELECT e.id, e.title, e.description, e.starts_at, e.location_label, e.latitude, e.longitude,
    e.author_id, u.name AS author_name, e.created_at, e.updated_at,
    (SELECT COUNT(*) FROM participations p WHERE p.event_id = e.id) AS participant_count,
    EXISTS (SELECT 1 FROM participations p WHERE p.event_id = e.id AND p.user_id = ?) AS is_participating
  FROM events e JOIN users u ON u.id = e.author_id`;

const toEvent = (r: EventRow): EventWithStatus => ({
  id: r.id,
  title: r.title,
  description: r.description,
  startsAt: r.starts_at,
  // Le lieu est tout ou rien : le libellé NULL signifie pas de lieu.
  location:
    r.location_label === null
      ? null
      : { label: r.location_label, latitude: r.latitude as number, longitude: r.longitude as number },
  authorId: r.author_id,
  authorName: r.author_name,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  participantCount: r.participant_count,
  isParticipating: r.is_participating === 1,
});

const locationParams = (input: EventInput): SqlValue[] => [
  input.location?.label ?? null,
  input.location?.latitude ?? null,
  input.location?.longitude ?? null,
];

/** Accès à la table events. `viewerId` sert à calculer `isParticipating` ; les dates sont en ISO 8601 UTC. */
export const eventsRepo = {
  async listAll(db: Db, viewerId: number): Promise<EventWithStatus[]> {
    const rows = await db.getAllAsync<EventRow>(`${SELECT_WITH_STATUS} ORDER BY e.starts_at ASC, e.id ASC`, viewerId);
    return rows.map(toEvent);
  },

  async getById(db: Db, id: number, viewerId: number): Promise<EventWithStatus | null> {
    const row = await db.getFirstAsync<EventRow>(`${SELECT_WITH_STATUS} WHERE e.id = ?`, viewerId, id);
    return row ? toEvent(row) : null;
  },

  async create(db: Db, authorId: number, input: EventInput, now: string): Promise<number> {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO events (title, description, starts_at, location_label, latitude, longitude, author_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.title,
      input.description,
      input.startsAt,
      ...locationParams(input),
      authorId,
      now,
      now,
    );
    return lastInsertRowId;
  },

  /** Modifie l'événement de `id` si `actorId` en est l'auteur ; renvoie `false` sinon (règle « seul l'auteur modifie » appliquée en SQL). */
  async update(db: Db, id: number, actorId: number, input: EventInput, now: string): Promise<boolean> {
    const { changes } = await db.runAsync(
      `UPDATE events SET title = ?, description = ?, starts_at = ?, location_label = ?, latitude = ?, longitude = ?,
         updated_at = ? WHERE id = ? AND author_id = ?`,
      input.title,
      input.description,
      input.startsAt,
      ...locationParams(input),
      now,
      id,
      actorId,
    );
    return changes > 0;
  },

  /** Supprime l'événement si `actorId` en est l'auteur ; renvoie `false` sinon. Les participations partent avec lui (ON DELETE CASCADE). */
  async remove(db: Db, id: number, actorId: number): Promise<boolean> {
    const { changes } = await db.runAsync('DELETE FROM events WHERE id = ? AND author_id = ?', id, actorId);
    return changes > 0;
  },
};
