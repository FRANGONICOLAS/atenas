import { useState, useEffect, useCallback } from 'react';
import { donationService } from '@/api/services/donation.service';
import type { DonationStats } from '@/types/donation.types';
import { useAuth } from './useAuth';
import { FIVE_MINUTES_MS, getTimedCache, setTimedCache } from '@/lib/timedCache';

export const useDonations = () => {
  const { user } = useAuth();
  const cacheKey = user?.id ? `donations:stats:${user.id}` : null;
  const cachedStats = cacheKey ? getTimedCache<DonationStats>(cacheKey) : null;
  const [stats, setStats] = useState<DonationStats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);
  const [error, setError] = useState<string | null>(null);

  const fetchDonationStats = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const userCacheKey = `donations:stats:${user.id}`;
    if (!forceRefresh) {
      const cached = getTimedCache<DonationStats>(userCacheKey);
      if (cached) {
        setStats(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const data = await donationService.getUserDonationStats(user.id);
      setStats(data);
      setTimedCache(userCacheKey, data, FIVE_MINUTES_MS);
    } catch (err) {
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
    refetch: () => fetchDonationStats(true),
  };
};
