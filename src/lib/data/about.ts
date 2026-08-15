import { Translation } from '@/lib/i18n/i18n';

export const getAboutTeam = (t: Translation, images: Record<string, string>) => [
  { name: 'Héctor Fabio Sanchez Landazuri', role: t.about.roles.director, image: images.team1 },
  { name: 'José Omar Suarez Molina', role: t.about.roles.director, image: images.team2 },
];
