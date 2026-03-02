import { Translation } from '@/lib/i18n/i18n';
import { Target, Heart, Trophy, Users } from "lucide-react";

export const getWhatWeDoActivities = (t: Translation, images: Record<string, string>) => [
  {
    icon: Target,
    title: t.whatWeDo.training.title,
    description: t.whatWeDo.training.description,
    imagePlaceholder: t.whatWeDo.placeholders.training,
    imageUrl: images.activity1,
  },
  {
    icon: Heart,
    title: t.whatWeDo.values.title,
    description: t.whatWeDo.values.description,
    imagePlaceholder: t.whatWeDo.placeholders.values,
    imageUrl: images.activity2,
  },
  {
    icon: Trophy,
    title: t.whatWeDo.tournaments.title,
    description: t.whatWeDo.tournaments.description,
    imagePlaceholder: t.whatWeDo.placeholders.tournaments,
    imageUrl: images.activity3,
  },
  {
    icon: Users,
    title: t.whatWeDo.community.title,
    description: t.whatWeDo.community.description,
    imagePlaceholder: t.whatWeDo.placeholders.community,
    imageUrl: images.activity4,
  },
];
