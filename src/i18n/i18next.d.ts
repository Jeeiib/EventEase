// Typage des clés de traduction : une clé inexistante devient une erreur tsc.
import type { fr } from './fr';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof fr;
    returnNull: false;
  }
}
