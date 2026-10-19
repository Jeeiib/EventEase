// Met la base ouverte au démarrage à disposition de tous les écrans.
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Db } from './connection';

const DbContext = createContext<Db | null>(null);

export function DbProvider({ db, children }: { db: Db; children: ReactNode }): React.JSX.Element {
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): Db {
  const db = useContext(DbContext);
  if (!db) throw new Error('useDb doit être appelé sous un DbProvider');
  return db;
}
