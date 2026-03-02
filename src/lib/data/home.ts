import { Translation } from '@/lib/i18n/i18n';
import { Users, Target, DollarSign, Calendar } from 'lucide-react';

export const getHomeImpactStats = (t: Translation) => [
  { icon: Users, value: '200+', label: t.home.beneficiaries },
  { icon: Target, value: '12', label: t.home.projects },
  { icon: DollarSign, value: '$50K+', label: t.home.donations },
  { icon: Calendar, value: '10', label: t.home.years },
];

export const getHomeCategories = (t: Translation) => [
  { age: '6-8', name: t.categories.items.sub6.name, players: 45 },
  { age: '8-10', name: t.categories.items.sub8.name, players: 52 },
  { age: '10-12', name: t.categories.items.sub10.name, players: 48 },
  { age: '12-15', name: t.categories.items.sub14.name, players: 60 },
  { age: '15-17', name: t.categories.items.sub16.name, players: 38 },
];

export const getHomeFeaturedPlayers = (t: Translation) => [
  { name: 'Santiago López', age: 14, position: t.positions.forward, goals: 23, image: '/image1.jpg' },
  { name: 'Mario García', age: 12, position: t.positions.midfielder, goals: 15, image: '/image2.jpg' },
  { name: 'Andrés Rodríguez', age: 16, position: t.positions.goalkeeper, goals: 0, image: '/image3.jpg' },
];
