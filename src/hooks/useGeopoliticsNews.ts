import { useQuery } from '@tanstack/react-query';
import type { NewsArticle } from '../types';
import { analyzeSentiment } from '../utils/sentiment';

async function fetchGdeltForTopic(query: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json`
    );
    if (!res.ok) throw new Error('GDELT fetch failed');
    const data = await res.json();
    const articles = data.articles || [];

    return articles.map((a: { title: string; url: string; domain: string; seendate: string; socialimage: string }) => ({
      id: btoa(encodeURIComponent((a.title + a.domain).slice(0, 50))).slice(0, 20),
      title: a.title,
      description: '',
      url: a.url,
      imageUrl: a.socialimage || undefined,
      source: a.domain,
      publishedAt: a.seendate
        ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(8, 10)}:${a.seendate.slice(10, 12)}:${a.seendate.slice(12, 14)}Z`
        : new Date().toISOString(),
      sentiment: analyzeSentiment(a.title),
      tags: [],
    }));
  } catch {
    return [];
  }
}

export function useGeopoliticsNews() {
  return useQuery({
    queryKey: ['geopolitics-all'],
    queryFn: async () => {
      const [oil, gulf, europe, russiachina, uspolitics, humanitarian] = await Promise.all([
        fetchGdeltForTopic('oil price iran OR brent crude iran OR strait hormuz'),
        fetchGdeltForTopic('qatar iran OR bahrain iran OR UAE iran OR saudi iran'),
        fetchGdeltForTopic('EU iran OR NATO iran OR germany iran OR france iran'),
        fetchGdeltForTopic('russia iran war OR china iran OR UN security council iran'),
        fetchGdeltForTopic('congress iran OR democrats iran OR republicans iran war powers'),
        fetchGdeltForTopic('iran civilians OR iran refugees OR iran humanitarian'),
      ]);

      return { oil, gulf, europe, russiachina, uspolitics, humanitarian };
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
