import { useState, useEffect, useCallback } from 'react';
import { donationService } from '@/api/services/donation.service';
import type { DonationStats } from '@/types/donation.types';
import { useAuth } from './useAuth';

export const useDonations = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonationStats = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await donationService.getUserDonationStats(user.id);
      setStats(data);
    } catch (err) {
      console.error('Error fetching donation stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDonationStats();
  }, [fetchDonationStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDonationStats
  };
};
