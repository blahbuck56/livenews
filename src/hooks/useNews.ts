import { useQuery } from '@tanstack/react-query';
import type { NewsArticle, GdeltArticle } from '../types';
import { deduplicateArticles } from '../utils/dedup';
import { analyzeSentiment } from '../utils/sentiment';

function generateId(title: string, source: string): string {
  return btoa(encodeURIComponent((title + source).slice(0, 50))).slice(0, 20);
}

function autoTag(article: { title: string; publishedAt: string }): string[] {
  const tags: string[] = [];
  const title = article.title.toLowerCase();

  if (title.includes('strike') || title.includes('airstrike') || title.includes('bomb')) tags.push('STRIKES');
  if (title.includes('nuclear')) tags.push('NUCLEAR');
  if (title.includes('missile')) tags.push('MISSILES');
  if (title.includes('oil') || title.includes('crude') || title.includes('energy')) tags.push('ENERGY');
  if (title.includes('irgc') || title.includes('military') || title.includes('army')) tags.push('MILITARY');
  if (title.includes('diplomacy') || title.includes('talks') || title.includes('negotiate') || title.includes('geneva')) tags.push('DIPLOMACY');
  if (title.includes('civilian') || title.includes('humanitarian') || title.includes('refugee')) tags.push('HUMANITARIAN');
  if (title.includes('retaliat') || title.includes('revenge')) tags.push('RETALIATION');
  if (title.includes('sanction')) tags.push('SANCTIONS');
  if (title.includes('cyber') || title.includes('internet')) tags.push('CYBER');

  const now = new Date();
  const published = new Date(article.publishedAt);
  const diffMin = (now.getTime() - published.getTime()) / 60000;
  if (diffMin < 10) tags.unshift('BREAKING');
  else if (diffMin < 60) tags.unshift('DEVELOPING');

  return tags;
}

async function fetchGdeltArticles(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(
      'https://api.gdeltproject.org/api/v2/doc/doc?query=iran+attack+OR+iran+strikes+OR+tehran&mode=artlist&maxrecords=50&format=json'
    );
    if (!res.ok) throw new Error('GDELT fetch failed');
    const data = await res.json();
    const articles: GdeltArticle[] = data.articles || [];

    return articles.map((a) => ({
      id: generateId(a.title, a.domain),
      title: a.title,
      description: '',
      url: a.url,
      imageUrl: a.socialimage || undefined,
      source: a.domain,
      sourceDomain: a.domain,
      publishedAt: a.seendate
        ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(8, 10)}:${a.seendate.slice(10, 12)}:${a.seendate.slice(12, 14)}Z`
        : new Date().toISOString(),
      sentiment: analyzeSentiment(a.title),
      tags: autoTag({ title: a.title, publishedAt: new Date().toISOString() }),
    }));
  } catch {
    return [];
  }
}

async function fetchGdeltTimeline(): Promise<{ date: string; count: number }[]> {
  try {
    const res = await fetch(
      'https://api.gdeltproject.org/api/v2/doc/doc?query=iran+attack&mode=timelinevol&TIMERES=60&format=json'
    );
    if (!res.ok) throw new Error('GDELT timeline fetch failed');
    const data = await res.json();
    const series = data.timeline?.[0]?.data || [];
    return series.map((d: { date: string; value: number }) => ({
      date: d.date,
      count: d.value,
    }));
  } catch {
    return [];
  }
}

async function fetchGdeltTone(): Promise<{ date: string; tone: number }[]> {
  try {
    const res = await fetch(
      'https://api.gdeltproject.org/api/v2/doc/doc?query=iran&mode=tonechart&format=json'
    );
    if (!res.ok) throw new Error('GDELT tone fetch failed');
    const data = await res.json();
    return (data.timeline?.[0]?.data || []).map((d: { date: string; value: number }) => ({
      date: d.date,
      tone: d.value,
    }));
  } catch {
    return [];
  }
}

export function useGdeltNews() {
  return useQuery({
    queryKey: ['gdelt-news'],
    queryFn: fetchGdeltArticles,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useGdeltTimeline() {
  return useQuery({
    queryKey: ['gdelt-timeline'],
    queryFn: fetchGdeltTimeline,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGdeltTone() {
  return useQuery({
    queryKey: ['gdelt-tone'],
    queryFn: fetchGdeltTone,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCombinedNews() {
  const gdelt = useGdeltNews();

  const articles = deduplicateArticles(gdelt.data || [], 0.5)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    articles,
    isLoading: gdelt.isLoading,
    isError: gdelt.isError,
    refetch: gdelt.refetch,
    lastUpdated: new Date().toISOString(),
  };
}
