// Point d'entrée : enregistre le composant racine, que ce soit dans Expo Go ou dans un build natif.
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
