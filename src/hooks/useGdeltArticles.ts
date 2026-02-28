import { useQuery } from '@tanstack/react-query';
import {
  fetchGdeltArticles,
  fetchGdeltTimeline,
  fetchGdeltTone,
  fetchGdeltTopicArticles,
  generateFallbackTopicArticles,
} from '../lib/api';
import { deduplicateArticles } from '../lib/dedup';
import { analyzeSentiment } from '../lib/sentiment';

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  sentiment: number;
  tags: string[];
}

function parseGdeltDate(seendate: string): string {
  if (!seendate) return new Date().toISOString();
  // Handle ISO format from fallback data
  if (seendate.includes('-')) return seendate;
  // GDELT returns dates in format "YYYYMMDDTHHMMSSZ" or "YYYYMMDDHHMMSS"
  const cleaned = seendate.replace(/[TZ]/g, '');
  if (cleaned.length < 14) return new Date().toISOString();
  const iso = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T${cleaned.slice(8, 10)}:${cleaned.slice(10, 12)}:${cleaned.slice(12, 14)}Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date().toISOString() : iso;
}

function autoTag(title: string, publishedAt: string): string[] {
  const tags: string[] = [];
  const t = title.toLowerCase();

  const now = Date.now();
  const pub = new Date(publishedAt).getTime();
  const diffMin = (now - pub) / 60000;
  if (diffMin < 30) tags.push('BREAKING');
  else if (diffMin < 120) tags.push('DEVELOPING');

  if (t.includes('strike') || t.includes('airstrike') || t.includes('bomb')) tags.push('Military');
  if (t.includes('nuclear')) tags.push('Nuclear');
  if (t.includes('missile')) tags.push('Missile');
  if (t.includes('oil') || t.includes('crude') || t.includes('energy') || t.includes('hormuz')) tags.push('Energy');
  if (t.includes('irgc') || t.includes('military') || t.includes('army') || t.includes('pentagon')) tags.push('Military');
  if (t.includes('diplomacy') || t.includes('talks') || t.includes('negotiate') || t.includes('geneva') || t.includes('ceasefire')) tags.push('Diplomacy');
  if (t.includes('civilian') || t.includes('humanitarian') || t.includes('refugee') || t.includes('casualt')) tags.push('Humanitarian');
  if (t.includes('tehran')) tags.push('Tehran');
  if (t.includes('retaliat')) tags.push('Retaliation');
  if (t.includes('hezbollah') || t.includes('houthi') || t.includes('proxy')) tags.push('Proxy');
  if (t.includes('nato') || t.includes('eu ') || t.includes('europe')) tags.push('NATO/EU');
  if (t.includes('russia') || t.includes('china') || t.includes('putin')) tags.push('Global');

  return [...new Set(tags)];
}

function generateId(title: string, domain: string): string {
  return btoa(encodeURIComponent((title + domain).slice(0, 60))).slice(0, 24);
}

export function useGdeltArticles() {
  return useQuery({
    queryKey: ['gdelt-articles'],
    queryFn: async (): Promise<Article[]> => {
      const data = await fetchGdeltArticles();
      const rawArticles = Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
      return rawArticles
        .filter((a: Record<string, unknown>) => a && typeof a.title === 'string' && a.title.trim())
        .map((a: { title: string; url: string; domain: string; seendate: string; socialimage: string }) => {
          const publishedAt = parseGdeltDate(a.seendate);
          const sentResult = analyzeSentiment(a.title);
          return {
            id: generateId(a.title, a.domain || 'unknown'),
            title: a.title,
            description: '',
            url: a.url || '',
            imageUrl: a.socialimage || undefined,
            source: a.domain || 'Unknown',
            publishedAt,
            sentiment: sentResult.comparative,
            tags: autoTag(a.title, publishedAt),
          };
        });
    },
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
    retry: 2,
  });
}

export function useGdeltTimeline() {
  return useQuery({
    queryKey: ['gdelt-timeline'],
    queryFn: async () => {
      const data = await fetchGdeltTimeline();
      const series = data?.timeline?.[0]?.data || [];
      return (series as Record<string, unknown>[])
        .filter((d: Record<string, unknown>) => d && d.date && typeof d.value === 'number')
        .map((d: Record<string, unknown>) => ({
          date: String(d.date),
          count: Number(d.value),
        }));
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useGdeltTone() {
  return useQuery({
    queryKey: ['gdelt-tone'],
    queryFn: async () => {
      const data = await fetchGdeltTone();
      const series = data?.timeline?.[0]?.data || [];
      return (series as Record<string, unknown>[])
        .filter((d: Record<string, unknown>) => d && d.date && typeof d.value === 'number')
        .map((d: Record<string, unknown>) => ({
          date: String(d.date),
          tone: Number(d.value),
        }));
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useCombinedNews() {
  const gdelt = useGdeltArticles();

  const articles = deduplicateArticles(gdelt.data || [], 0.6)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    articles,
    isLoading: gdelt.isLoading,
    isError: gdelt.isError,
    refetch: gdelt.refetch,
  };
}

export function useGeopoliticsNews() {
  return useQuery({
    queryKey: ['geopolitics-all'],
    queryFn: async () => {
      const topics = [
        { key: 'oil', query: 'oil iran OR strait hormuz OR brent crude iran' },
        { key: 'gulf', query: 'qatar iran OR bahrain iran OR UAE iran OR saudi iran' },
        { key: 'europe', query: 'EU iran OR NATO iran OR europe iran' },
        { key: 'russiachina', query: 'russia iran OR china iran OR UN security council iran' },
        { key: 'uspolitics', query: 'congress iran OR war powers iran OR pentagon iran' },
        { key: 'humanitarian', query: 'iran civilians OR iran refugees OR iran humanitarian OR iran casualties' },
      ];

      const results = await Promise.all(
        topics.map(async (t) => {
          try {
            const data = await fetchGdeltTopicArticles(t.query);
            const rawArticles: Record<string, unknown>[] = Array.isArray(data?.articles) ? data.articles : [];
            const articles = rawArticles
              .filter((a: Record<string, unknown>) => a && typeof a.title === 'string' && (a.title as string).trim())
              .slice(0, 5)
              .map((a: Record<string, unknown>) => ({
                id: generateId(String(a.title), String(a.domain || 'unknown')),
                title: String(a.title),
                url: String(a.url || ''),
                source: String(a.domain || 'Unknown'),
                publishedAt: parseGdeltDate(String(a.seendate || '')),
              }));
            return { key: t.key, articles };
          } catch {
            return { key: t.key, articles: [] };
          }
        })
      );

      // Check if we got any articles from live APIs
      const totalArticles = results.reduce((sum, r) => sum + r.articles.length, 0);

      if (totalArticles === 0) {
        // Use fallback data for all topics
        const fallback = generateFallbackTopicArticles();
        const map: Record<string, { id: string; title: string; url: string; source: string; publishedAt: string }[]> = {};
        for (const [key, articles] of Object.entries(fallback)) {
          map[key] = articles.map((a) => ({
            id: generateId(a.title, a.domain),
            title: a.title,
            url: a.url,
            source: a.domain,
            publishedAt: parseGdeltDate(a.seendate),
          }));
        }
        return map;
      }

      // Use live data, filling in any empty topics from fallback
      const fallback = generateFallbackTopicArticles();
      const map: Record<string, { id: string; title: string; url: string; source: string; publishedAt: string }[]> = {};
      for (const r of results) {
        if (r.articles.length > 0) {
          map[r.key] = r.articles;
        } else {
          // Fill empty topics from fallback
          map[r.key] = (fallback[r.key] || []).map((a) => ({
            id: generateId(a.title, a.domain),
            title: a.title,
            url: a.url,
            source: a.domain,
            publishedAt: parseGdeltDate(a.seendate),
          }));
        }
      }
      return map;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
