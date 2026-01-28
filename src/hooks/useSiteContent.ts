import { useState, useEffect } from 'react';
import { contentService } from '@/api/services';
import type { SiteContent, PageSection } from '@/types';

export function useSiteContent(contentKey: string, fallbackUrl?: string) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await contentService.getContentByKey(contentKey);
        
        if (data) {
          setContent(data);
          if (data.public_url) {
            setImageUrl(data.public_url);
          }
        } else if (fallbackUrl) {
          setImageUrl(fallbackUrl);
        }
      } catch (err) {
        console.error(`Error loading content ${contentKey}:`, err);
        setError(err as Error);
        
        // Usar fallback si hay error
        if (fallbackUrl) {
          setImageUrl(fallbackUrl);
        }
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentKey, fallbackUrl]);

  return { content, imageUrl, loading, error };
}

export function useSiteContentBySection(section: PageSection) {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadContents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await contentService.getContentsBySection(section);
        setContents(data);
      } catch (err) {
        console.error(`Error loading contents for section ${section}:`, err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, [section]);

  return { contents, loading, error };
}
