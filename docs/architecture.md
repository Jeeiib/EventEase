# EventEase : architecture et choix techniques

- **Couches** : tout le SQL vit dans `db` et `data`, les écrans passent par eux sans en écrire.
- **SQLite** plutôt qu'AsyncStorage : données relationnelles, participations supprimées en cascade.
- **Schéma versionné** par `PRAGMA user_version`, pour le faire évoluer sans perdre une base existante.
- **Navigation** : React Navigation, pile de connexion sans session, trois onglets une fois connecté.
- **Mots de passe** salés et hachés en SHA-256, jamais en clair ; un serveur prendrait Argon2.
- **APIs sans clé** : météo Open-Meteo et adresses de l'IGN, aucun secret dans un dépôt public.
- **Permissions** demandées au moment du besoin, et l'application reste utilisable sans elles.
- **i18next** dès le départ : aucun texte en dur, une règle ESLint le vérifie.
- **Accessibilité** : VoiceOver, cibles de 44 pt, Dynamic Type et contrastes WCAG AA.
- **Qualité** : tests Jest, et une CI qui vérifie SDK, ESLint, Prettier, types et tests à chaque PR.
