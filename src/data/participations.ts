// Accès à la table participations.
import type { Db } from '@/db/connection';

export const participationsRepo = {
  // Bascule dans une transaction pour que l'état et le compteur renvoyés restent cohérents.
  async toggle(
    db: Db,
    userId: number,
    eventId: number,
    now: string,
  ): Promise<{ isParticipating: boolean; participantCount: number }> {
    let isParticipating = false;
    let participantCount = 0;
    await db.withTransactionAsync(async () => {
      const removed = await db.runAsync(
        'DELETE FROM participations WHERE user_id = ? AND event_id = ?',
        userId,
        eventId,
      );
      if (removed.changes === 0) {
        await db.runAsync(
          'INSERT INTO participations (user_id, event_id, created_at) VALUES (?, ?, ?)',
          userId,
          eventId,
          now,
        );
        isParticipating = true;
      }
      const row = await db.getFirstAsync<{ n: number }>(
        'SELECT COUNT(*) AS n FROM participations WHERE event_id = ?',
        eventId,
      );
      participantCount = row?.n ?? 0;
    });
    return { isParticipating, participantCount };
  },

  async countByUser(db: Db, userId: number): Promise<number> {
    const row = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM participations WHERE user_id = ?',
      userId,
    );
    return row?.n ?? 0;
  },
};
