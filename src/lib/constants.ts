export const schoolYears = [
  { id: 1, label: "1ère Année", shortLabel: "1ère", description: "Bases fondamentales", subjects: 12 },
  { id: 2, label: "2ème Année", shortLabel: "2ème", description: "Morphologie normale", subjects: 15 },
  { id: 3, label: "3ème Année", shortLabel: "3ème", description: "Pathologies fondamentales", subjects: 18 },
  { id: 4, label: "4ème Année", shortLabel: "4ème", description: "Clinique médicale", subjects: 22 },
  { id: 5, label: "5ème Année", shortLabel: "5ème", description: "Spécialités médicales", subjects: 25 },
  { id: 6, label: "6ème Année", shortLabel: "6ème", description: "Internat", subjects: 20 },
  { id: 7, label: "7ème Année", shortLabel: "7ème", description: "Printemps de la carrière", subjects: 15 },
] as const;

export const translations = {
  fr: {
    welcome: "Bienvenue à la plateforme",
    tagline: "Votre bibliothèque d'examens médicaux",
    subtitle: "Préparez-vous efficacement à vos examens avec notre collection complète d'épreuves.",
    selectYear: "Sélectionnez votre année",
    explore: "Explorer les examens",
    copyright: "Tous droits réservés.",
    about: "À propos",
    contact: "Contact",
    help: "Aide",
  },
  en: {
    welcome: "Welcome to the platform",
    tagline: "Your medical exam library",
    subtitle: "Prepare efficiently for your exams with our complete collection of papers.",
    selectYear: "Select your year",
    explore: "Explore exams",
    copyright: "All rights reserved.",
    about: "About",
    contact: "Contact",
    help: "Help",
  },
} as const;

export type Locale = keyof typeof translations;
export type SchoolYear = (typeof schoolYears)[number];
