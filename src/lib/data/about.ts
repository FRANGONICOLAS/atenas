import { Translation } from '@/lib/i18n/i18n';
import { Heart, Shield, Users, Award, Handshake } from 'lucide-react';

export const getAboutValues = (t: Translation) => [
  { icon: Heart, title: t.about.valuesList.passion.title, description: t.about.valuesList.passion.desc },
  { icon: Shield, title: t.about.valuesList.integrity.title, description: t.about.valuesList.integrity.desc },
  { icon: Users, title: t.about.valuesList.teamwork.title, description: t.about.valuesList.teamwork.desc },
  { icon: Award, title: t.about.valuesList.excellence.title, description: t.about.valuesList.excellence.desc },
  { icon: Handshake, title: t.about.valuesList.commitment.title, description: t.about.valuesList.commitment.desc },
];

export const getAboutTeam = (t: Translation, images: Record<string, string>) => [
  { name: 'Hector Sanchez', role: t.about.roles.director, image: images.team1 },
  { name: 'Omar', role: t.about.roles.director, image: images.team2 },
];
