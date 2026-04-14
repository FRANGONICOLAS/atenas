export const queryKeys = {
  public: {
    gallery: ['public', 'gallery'] as const,
    projects: ['public', 'projects'] as const,
    beneficiaries: ['public', 'beneficiaries'] as const,
    testimonialsApproved: ['public', 'testimonials', 'approved'] as const,
    locations: (defaultSchedule: string) =>
      ['public', 'locations', defaultSchedule] as const,
  },
  content: {
    byKeys: (keys: string[]) => ['siteContentsByKeys', keys] as const,
  },
};
