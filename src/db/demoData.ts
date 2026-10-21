// Contenu du jeu de démonstration : des données, pas du texte d'interface (donc hors i18n).
import type { EventLocation } from '@/data/types';

/** Mot de passe commun aux quatre comptes de démonstration (voir le README). */
export const DEMO_PASSWORD = 'demo2026';

export const demoUsers: { name: string; email: string }[] = [
  { name: 'Marie Lefèvre', email: 'marie.lefevre@exemple.fr' },
  { name: 'Paul Martin', email: 'paul.martin@exemple.fr' },
  { name: 'Sophie Dubois', email: 'sophie.dubois@exemple.fr' },
  { name: 'Julien Moreau', email: 'julien.moreau@exemple.fr' },
];

// Coordonnées issues de la Géoplateforme (data.geopf.fr/geocodage) : adresse postale ou, pour un lieu-dit,
// point d'intérêt (index poi) ; la source est indiquée en commentaire à côté de chaque coordonnée.
const museePleinAir: EventLocation = {
  label: "Musée de plein air, Villeneuve-d'Ascq",
  latitude: 50.624631, // point d'intérêt « Musée de Plein Air » (Géoplateforme, index poi)
  longitude: 3.181843,
};
const maisonFolie: EventLocation = {
  label: 'Maison Folie Wazemmes, Lille',
  latitude: 50.624937, // 70 rue des Sarrazins, 59000 Lille
  longitude: 3.04819,
};
const placeAuxOignons: EventLocation = {
  label: 'Place aux Oignons, Lille',
  latitude: 50.640972, // Place aux Oignons, 59800 Lille
  longitude: 3.061464,
};
const villaCavrois: EventLocation = {
  label: 'Villa Cavrois, Croix',
  latitude: 50.668653, // point d'intérêt « Villa Cavrois » (Géoplateforme, index poi)
  longitude: 3.153416,
};
const lam: EventLocation = {
  label: "LaM, Villeneuve-d'Ascq",
  latitude: 50.6374, // point d'intérêt « Lille Métropole Musée d'Art Moderne… » (Géoplateforme, index poi)
  longitude: 3.150513,
};
const citadelle: EventLocation = {
  label: 'Citadelle de Lille',
  latitude: 50.641191, // point d'intérêt « Citadelle » (Géoplateforme, index poi)
  longitude: 3.043524,
};
const hospiceHavre: EventLocation = {
  label: "Hospice d'Havré, Tourcoing",
  latitude: 50.720777, // 100 rue de Tournai, 59200 Tourcoing
  longitude: 3.163423,
};
const parcBarbieux: EventLocation = {
  label: 'Parc Barbieux, Roubaix',
  latitude: 50.677569, // point d'intérêt « Parc Barbieux » (Géoplateforme, index poi)
  longitude: 3.1616,
};

/** `dayOffset` : jours depuis le premier lancement ; `hour` et `minute` : heure locale. */
export const demoEvents: {
  title: string;
  description: string;
  dayOffset: number;
  hour: number;
  minute: number;
  authorEmail: string;
  location: EventLocation | null;
  participantEmails: string[];
}[] = [
  {
    title: 'Jeux flamands au musée de plein air',
    description:
      'Bourle, toupie, billard Nicolas et jeu de la grenouille : on découvre les jeux d’estaminet du Nord avec un animateur du musée. Rendez-vous devant l’accueil, entrée offerte aux membres.',
    dayOffset: 5,
    hour: 10,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: museePleinAir,
    participantEmails: ['marie.lefevre@exemple.fr', 'paul.martin@exemple.fr', 'julien.moreau@exemple.fr'],
  },
  {
    title: 'Soirée quiz : ch’ti ou pas ch’ti ?',
    description:
      'Six manches sur le patois, la cuisine et l’histoire du Nord, par équipes de quatre. L’équipe perdante apporte les gaufres à la prochaine soirée.',
    dayOffset: 8,
    hour: 19,
    minute: 0,
    authorEmail: 'paul.martin@exemple.fr',
    location: maisonFolie,
    participantEmails: ['sophie.dubois@exemple.fr', 'julien.moreau@exemple.fr'],
  },
  {
    title: 'Balade photo dans le Vieux-Lille',
    description:
      'Deux heures dans les rues pavées, de la place aux Oignons à la cathédrale de la Treille, avec un photographe du club pour apprendre à cadrer. Un téléphone suffit.',
    dayOffset: 12,
    hour: 9,
    minute: 30,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: placeAuxOignons,
    participantEmails: ['paul.martin@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Visite guidée de la Villa Cavrois',
    description:
      'La villa de Robert Mallet-Stevens, restaurée de la cave aux terrasses. Visite d’une heure et demie limitée à vingt personnes : inscris-toi pour qu’on réserve ta place.',
    dayOffset: 12,
    hour: 14,
    minute: 0,
    authorEmail: 'sophie.dubois@exemple.fr',
    location: villaCavrois,
    participantEmails: ['julien.moreau@exemple.fr'],
  },
  {
    title: 'Atelier carbonade flamande',
    description:
      'On cuisine ensemble une carbonade au pain d’épices et à la bière brune, puis on la partage. Le lieu sera communiqué aux inscrits.',
    dayOffset: 16,
    hour: 18,
    minute: 30,
    authorEmail: 'julien.moreau@exemple.fr',
    location: null,
    participantEmails: ['marie.lefevre@exemple.fr'],
  },
  {
    title: 'L’art brut au LaM',
    description:
      'Une médiatrice nous fait découvrir la collection d’art brut du musée, l’une des plus riches d’Europe. Retour possible à pied par le parc.',
    dayOffset: 25,
    hour: 14,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: lam,
    participantEmails: ['marie.lefevre@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Sortie vélo le long de la Deûle',
    description:
      'Une vingtaine de kilomètres à plat, de la Citadelle jusqu’à Wambrechies, avec une pause au port fluvial. Casque obligatoire, rythme tranquille.',
    dayOffset: -2,
    hour: 10,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: citadelle,
    participantEmails: ['marie.lefevre@exemple.fr', 'paul.martin@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Ciné-débat : Bienvenue chez les Ch’tis',
    description:
      'Le film sur grand écran, puis un débat sur les clichés qu’on entend encore sur le Nord. Frites offertes à l’entracte.',
    dayOffset: -7,
    hour: 19,
    minute: 0,
    authorEmail: 'sophie.dubois@exemple.fr',
    location: hospiceHavre,
    participantEmails: ['paul.martin@exemple.fr', 'julien.moreau@exemple.fr'],
  },
  {
    title: 'Tournoi de pétanque de rentrée',
    description:
      'Doublettes tirées au sort et apéro offert par l’association. Pas besoin d’avoir ses boules, on en prête.',
    dayOffset: -15,
    hour: 12,
    minute: 0,
    authorEmail: 'paul.martin@exemple.fr',
    location: parcBarbieux,
    participantEmails: ['marie.lefevre@exemple.fr', 'sophie.dubois@exemple.fr', 'julien.moreau@exemple.fr'],
  },
  {
    title: 'Veillée des géants et légendes du Nord',
    description:
      'Gayant, Lydéric et Phinaert : Julien raconte les légendes qui ont donné naissance aux géants de nos carnavals. Chicorée et spéculoos fournis, lieu communiqué aux inscrits.',
    dayOffset: -20,
    hour: 20,
    minute: 0,
    authorEmail: 'julien.moreau@exemple.fr',
    location: null,
    participantEmails: ['paul.martin@exemple.fr'],
  },
];
