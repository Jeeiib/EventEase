// Types partagés entre la base, les services et les écrans.
export type User = { id: number; name: string; email: string; createdAt: string };

export type EventLocation = { label: string; latitude: number; longitude: number };

export type AppEvent = {
  id: number;
  title: string;
  description: string;
  /** Début, en ISO 8601 UTC. */
  startsAt: string;
  location: EventLocation | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

/** Événement vu par un utilisateur : nombre de participants et participation de ce spectateur. */
export type EventWithStatus = AppEvent & { participantCount: number; isParticipating: boolean };

/** Ce que saisit l'auteur : sans identifiant ni dates de gestion. */
export type EventInput = {
  title: string;
  description: string;
  startsAt: string;
  location: EventLocation | null;
};
