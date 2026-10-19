// Contenu du jeu de démonstration : des données, pas du texte d'interface (donc hors i18n).
import type { EventLocation } from '@/data/types';

// Même mot de passe pour les quatre comptes, documenté dans le README.
export const DEMO_PASSWORD = 'demo2026';

export const demoUsers: { name: string; email: string }[] = [
  { name: 'Marie Lefèvre', email: 'marie.lefevre@exemple.fr' },
  { name: 'Paul Martin', email: 'paul.martin@exemple.fr' },
  { name: 'Sophie Dubois', email: 'sophie.dubois@exemple.fr' },
  { name: 'Karim Benali', email: 'karim.benali@exemple.fr' },
];

// Coordonnées issues de la Géoplateforme (data.geopf.fr/geocodage) : adresse postale ou, pour un lieu-dit,
// point d'intérêt (index poi) ; la source est indiquée en commentaire à côté de chaque coordonnée.
const parcBarbieux: EventLocation = {
  label: 'Parc Barbieux, Roubaix',
  latitude: 50.677569, // point d'intérêt « Parc Barbieux » (Géoplateforme, index poi)
  longitude: 3.1616,
};
const corderie: EventLocation = {
  label: 'Médiathèque La Corderie, Marcq-en-Barœul',
  latitude: 50.669125, // Rue de la Rianderie, 59700 Marcq-en-Barœul
  longitude: 3.097512,
};
const lacHeron: EventLocation = {
  label: "Lac du Héron, Villeneuve-d'Ascq",
  latitude: 50.635536, // point d'intérêt « Lac du Héron » (Géoplateforme, index poi)
  longitude: 3.171167,
};
const grandPlaceArmentieres: EventLocation = {
  label: 'Grand Place, Armentières',
  latitude: 50.686549, // Place du Général de Gaulle, 59280 Armentières
  longitude: 2.881634,
};
const piscine: EventLocation = {
  label: "23 rue de l'Espérance, Roubaix",
  latitude: 50.693067, // 23 rue de l'Espérance, 59100 Roubaix
  longitude: 3.167691,
};
const jardinPartage: EventLocation = {
  label: 'Jardin partagé du Molinel, Wasquehal',
  latitude: 50.68591, // Rue du Molinel, 59290 Wasquehal
  longitude: 3.115067,
};
const maisonAssociations: EventLocation = {
  label: 'Maison des associations, Croix',
  latitude: 50.678528, // Avenue Roger Salengro, 59170 Croix
  longitude: 3.15266,
};

// dayOffset : jours depuis le premier lancement ; hour et minute : heure locale.
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
    title: 'Atelier réparation de vélos',
    description:
      'On apprend à régler ses freins, changer une chambre à air et entretenir sa chaîne. Venez avec votre vélo, on fournit les outils et le café.',
    dayOffset: 5,
    hour: 10,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: parcBarbieux,
    participantEmails: ['marie.lefevre@exemple.fr', 'paul.martin@exemple.fr', 'karim.benali@exemple.fr'],
  },
  {
    title: 'Conférence : le zéro déchet au quotidien',
    description:
      'Une soirée pour réduire ses déchets sans y passer ses week-ends : courses en vrac, produits ménagers maison et retours d’expérience des membres.',
    dayOffset: 8,
    hour: 19,
    minute: 0,
    authorEmail: 'paul.martin@exemple.fr',
    location: corderie,
    participantEmails: ['sophie.dubois@exemple.fr', 'karim.benali@exemple.fr'],
  },
  {
    title: 'Balade nature au lac du Héron',
    description:
      'Tour du lac à pied, environ 6 km. On observe les oiseaux avec un guide de la LPO. Prévoir des chaussures qui ne craignent pas la boue.',
    dayOffset: 12,
    hour: 9,
    minute: 30,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: lacHeron,
    participantEmails: ['paul.martin@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Atelier couture : réparer ses vêtements',
    description:
      'On reprend un ourlet, on recoud un bouton et on pose une pièce sur un genou usé. Apportez un vêtement à réparer, les machines et le fil sont sur place.',
    dayOffset: 12,
    hour: 14,
    minute: 0,
    authorEmail: 'sophie.dubois@exemple.fr',
    location: grandPlaceArmentieres,
    participantEmails: ['karim.benali@exemple.fr'],
  },
  {
    title: 'Atelier cuisine anti-gaspi',
    description:
      'On cuisine ensemble les invendus du marché de Wasquehal : soupe, cake salé et compote. Chacun repart avec une part et les recettes.',
    dayOffset: 16,
    hour: 18,
    minute: 30,
    authorEmail: 'karim.benali@exemple.fr',
    location: null,
    participantEmails: ['marie.lefevre@exemple.fr'],
  },
  {
    title: 'Visite du musée La Piscine',
    description: 'Visite guidée de l’exposition d’automne. Entrée gratuite pour les adhérents, rendez-vous devant l’accueil.',
    dayOffset: 25,
    hour: 14,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: piscine,
    participantEmails: ['marie.lefevre@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Atelier compost au jardin partagé',
    description:
      'On a monté le deuxième bac à compost et appris à équilibrer matières vertes et brunes. Merci aux sept courageux sous la pluie.',
    dayOffset: -2,
    hour: 10,
    minute: 0,
    authorEmail: 'marie.lefevre@exemple.fr',
    location: jardinPartage,
    participantEmails: ['marie.lefevre@exemple.fr', 'paul.martin@exemple.fr', 'sophie.dubois@exemple.fr'],
  },
  {
    title: 'Conférence : réparer plutôt que jeter',
    description:
      'Un réparateur du Repair Café de Croix explique comment diagnostiquer une panne simple sur un petit appareil, et quand il vaut mieux renoncer.',
    dayOffset: -7,
    hour: 19,
    minute: 0,
    authorEmail: 'sophie.dubois@exemple.fr',
    location: maisonAssociations,
    participantEmails: ['paul.martin@exemple.fr', 'karim.benali@exemple.fr'],
  },
  {
    title: 'Pique-nique de rentrée',
    description:
      'Chacun apporte un plat à partager et une nappe. Un moment pour se retrouver après l’été, présenter les projets de la saison et accueillir les nouveaux venus.',
    dayOffset: -15,
    hour: 12,
    minute: 0,
    authorEmail: 'paul.martin@exemple.fr',
    location: parcBarbieux,
    participantEmails: ['marie.lefevre@exemple.fr', 'sophie.dubois@exemple.fr', 'karim.benali@exemple.fr'],
  },
  {
    title: 'Soirée jeux de société',
    description:
      'Une vingtaine de jeux de société, des classiques aux nouveautés, pour tous les niveaux. Les règles sont expliquées sur place, on prévoit de quoi grignoter.',
    dayOffset: -20,
    hour: 20,
    minute: 0,
    authorEmail: 'karim.benali@exemple.fr',
    location: null,
    participantEmails: ['paul.martin@exemple.fr'],
  },
];
