import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContentsByKeys } from '@/hooks/useSiteContent';
import { donationService } from '@/api/services/donation.service';
import { HeroSection } from '../components/HeroSection';
import { ProblemSection } from '../components/ProblemSection';
import { TransformationSection } from '../components/TransformationSection';
import { DonationStatsSection } from '../components/DonationStatsSection';
import { DonationsUsageSection } from '../components/DonationsUsageSection';
import CTA from '@/components/CTA';

const HOME_KEYS = [
  'home_hero', 'home_problem', 'home_impact', 'home_projects',
  'home_transformation_1', 'home_transformation_2', 'home_transformation_3',
  'home_transformation_4', 'home_transformation_5', 'home_transformation_6',
];

const HomePage = () => {
  const { t } = useLanguage();
  const { imageMap } = useSiteContentsByKeys(HOME_KEYS);

  const [donationStats, setDonationStats] = useState<{
    totalDonations: number;
    totalRaised: number;
    recentDonations: Array<{
      donation_id: string;
      amount: string;
      currency: string;
      date: string;
      project_name: string | null;
    }>;
  } | null>(null);

  useEffect(() => {
    donationService.getPublicDonationStats()
      .then(setDonationStats)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection heroImageUrl={imageMap['home_hero']} />
      <ProblemSection problemUrl={imageMap['home_problem']} impactUrl={imageMap['home_impact']} />
      <TransformationSection images={imageMap} />
      <DonationStatsSection stats={donationStats} />
      <DonationsUsageSection projectsImageUrl={imageMap['home_projects']} impactImageUrl={imageMap['home_impact']} />
      <CTA />
    </div>
  );
};

export default HomePage;
