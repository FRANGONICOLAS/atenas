import { useQuery, useQueries } from '@tanstack/react-query';
import { contentService } from '@/api/services';
import type { SiteContent, PageSection } from '@/types';

export function useSiteContent(contentKey: string, fallbackUrl?: string) {
  const result = useQuery<SiteContent | null, Error>({
    queryKey: ['siteContent', contentKey],
    queryFn: () => contentService.getContentByKey(contentKey),
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: 1,
  });

  const content = (result.data as SiteContent | null) ?? null;
  const imageUrl = content?.public_url || fallbackUrl || '';

  return {
    content,
    imageUrl,
    loading: result.isLoading,
    error: result.error ?? null,
  };
}

export function useSiteContentBySection(section: PageSection) {
  const result = useQuery<SiteContent[], Error>({
    queryKey: ['siteContents', section],
    queryFn: () => contentService.getContentsBySection(section),
    staleTime: 1000 * 60 * 60,
  });

  return {
    contents: result.data ?? [],
    loading: result.isLoading,
    error: result.error ?? null,
  };
}

export function useSiteContents(keys: string[]) {
  const queries = useQueries({
    queries: keys.map((key) => ({
      queryKey: ['siteContent', key] as const,
      queryFn: (): Promise<SiteContent | null> => contentService.getContentByKey(key),
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60 * 24,
      retry: 1,
    })),
  });

  const dataMap: Record<string, SiteContent | null> = {};
  keys.forEach((k, idx) => {
    dataMap[k] = (queries[idx].data as SiteContent | null) ?? null;
  });

  const imageMap: Record<string, string> = {};
  keys.forEach((k, idx) => {
    const item = queries[idx].data as SiteContent | null;
    imageMap[k] = item?.public_url || '';
  });

  const loading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error ?? null;

  return { dataMap, imageMap, loading, error };
}

export function useSiteContentsByKeys(keys: string[]) {
  const result = useQuery<SiteContent[], Error>({
    queryKey: ['siteContentsByKeys', keys],
    queryFn: () => contentService.getContentsByKeys(keys),
    staleTime: 1000 * 60 * 60,
    enabled: keys.length > 0,
  });

  const dataArray = (result.data ?? []) as SiteContent[];
  const dataMap: Record<string, SiteContent> = {};
  dataArray.forEach((item) => {
    dataMap[item.content_key] = item;
  });

  const imageMap: Record<string, string> = {};
  dataArray.forEach((item) => {
    imageMap[item.content_key] = item.public_url || '';
  });

  return {
    dataMap,
    imageMap,
    loading: result.isLoading,
    error: result.error ?? null,
  };
}
