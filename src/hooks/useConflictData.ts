// Conflict-aware data fetching hooks.
// Every hook takes a conflictId and includes it in its queryKey so that
// TanStack Query automatically refetches when the selected conflict changes.

import { useQuery } from '@tanstack/react-query';
import {
  fetchGdeltArticles,
  fetchGdeltTimeline,
  fetchGdeltTone,
} from '../lib/api';
import { CONFLICTS, type ConflictId } from '../data/conflicts';
import { analyzeSentiment } from '../lib/sentiment';
import { deduplicateArticles } from '../lib/dedup';

// ─── STOPWORDS for keyword extraction ───────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'not',
  'no', 'nor', 'so', 'up', 'out', 'if', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'than', 'too', 'very', 'just', 'also',
  'now', 'new', 'says', 'said', 'over', 'its', 'that', 'this', 'it',
  'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'she',
  'his', 'her', 'him', 'who', 'what', 'which', 'while', 'only',
  'amp', 'quot', 'per', 'via', 'amid', 'among', 'since', 'after',
  'reports', 'report', 'news', 'update', 'live', 'breaking',
]);

// ─── ARTICLE INTERFACE ──────────────────────────────────────────────────────────

export interface ConflictArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: number;
  category: 'military' | 'diplomacy' | 'humanitarian' | 'economic' | 'general';
}

function parseGdeltDate(seendate: string): string {
  if (!seendate) return new Date().toISOString();
  if (seendate.includes('-')) return seendate;
  const cleaned = seendate.replace(/[TZ]/g, '');
  if (cleaned.length < 14) return new Date().toISOString();
  const iso = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T${cleaned.slice(8, 10)}:${cleaned.slice(10, 12)}:${cleaned.slice(12, 14)}Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date().toISOString() : iso;
}

function categorize(title: string): ConflictArticle['category'] {
  const t = title.toLowerCase();
  if (/strike|military|bomb|missile|troops|pentagon|army|navy|idf|drone|weapon|defense|offensive/.test(t)) return 'military';
  if (/diplomat|negotiat|ceasefire|talks|UN|sanction|summit|resolution|embassy|treaty/.test(t)) return 'diplomacy';
  if (/civilian|humanitarian|refugee|displaced|casualt|hospital|aid|famine|hunger|red cross/.test(t)) return 'humanitarian';
  if (/oil|crude|market|stock|economy|trade|shipping|price|billion|gdp|recession|inflation/.test(t)) return 'economic';
  return 'general';
}

function generateId(title: string, domain: string): string {
  return btoa(encodeURIComponent((title + domain).slice(0, 60))).slice(0, 24);
}

// ─── MAIN ARTICLE FEED ─────────────────────────────────────────────────────────

export function useConflictFeed(conflictId: ConflictId) {
  const config = CONFLICTS[conflictId];

  return useQuery({
    queryKey: ['conflict-feed', conflictId],
    queryFn: async (): Promise<ConflictArticle[]> => {
      const data = await fetchGdeltArticles(config.gdeltQuery);
      const rawArticles = Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];
      const articles = rawArticles
        .filter((a: Record<string, unknown>) => a && typeof a.title === 'string' && (a.title as string).trim())
        .map((a: { title: string; url: string; domain: string; seendate: string }) => {
          const publishedAt = parseGdeltDate(a.seendate);
          const sentResult = analyzeSentiment(a.title);
          return {
            id: generateId(a.title, a.domain || 'unknown'),
            title: a.title,
            url: a.url || '',
            source: a.domain || 'Unknown',
            publishedAt,
            sentiment: sentResult.comparative,
            category: categorize(a.title),
          } as ConflictArticle;
        });
      return deduplicateArticles<ConflictArticle>(articles, 0.6)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 2,
  });
}

// ─── TIMELINE (Article Volume) ──────────────────────────────────────────────────

export function useConflictTimeline(conflictId: ConflictId) {
  const config = CONFLICTS[conflictId];

  return useQuery({
    queryKey: ['conflict-timeline', conflictId],
    queryFn: async () => {
      const data = await fetchGdeltTimeline(config.gdeltGeoQuery);
      const series = data?.timeline?.[0]?.data || [];
      return (series as Record<string, unknown>[])
        .filter((d: Record<string, unknown>) => d && d.date && typeof d.value === 'number')
        .map((d: Record<string, unknown>) => ({
          date: String(d.date),
          count: Number(d.value),
        }));
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
  });
}

// ─── TONE (Sentiment Over Time) ─────────────────────────────────────────────────

export function useConflictTone(conflictId: ConflictId) {
  const config = CONFLICTS[conflictId];

  return useQuery({
    queryKey: ['conflict-tone', conflictId],
    queryFn: async () => {
      const data = await fetchGdeltTone(config.gdeltGeoQuery);
      const series = data?.timeline?.[0]?.data || [];
      return (series as Record<string, unknown>[])
        .filter((d: Record<string, unknown>) => d && d.date && typeof d.value === 'number')
        .map((d: Record<string, unknown>) => ({
          date: String(d.date),
          tone: Number(d.value),
        }));
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
  });
}

// ─── COMPUTED METRICS ───────────────────────────────────────────────────────────

export interface ComputedMetrics {
  articleCount: number;
  avgSentiment: number;
  sourceCount: number;
  countriesMentioned: number;
  theaterCount: number;
}

const COUNTRY_NAMES = [
  'iran', 'iraq', 'syria', 'israel', 'lebanon', 'yemen', 'qatar', 'kuwait',
  'bahrain', 'saudi', 'turkey', 'jordan', 'egypt', 'russia', 'china',
  'ukraine', 'france', 'germany', 'united states', 'united kingdom', 'britain',
  'india', 'japan', 'pakistan', 'afghanistan', 'sudan', 'ethiopia', 'somalia',
  'libya', 'myanmar', 'burma', 'mali', 'congo', 'drc', 'haiti', 'venezuela',
  'colombia', 'mexico', 'brazil', 'south africa', 'nigeria', 'kenya',
  'north korea', 'south korea', 'taiwan', 'philippines', 'indonesia',
  'poland', 'romania', 'czech', 'sweden', 'finland', 'norway',
  'nato', 'eu', 'un', 'opec',
];

export function computeMetrics(
  articles: ConflictArticle[],
  theaterCount: number,
): ComputedMetrics {
  const avgSentiment = articles.length
    ? articles.reduce((s, a) => s + a.sentiment, 0) / articles.length
    : 0;
  const sources = new Set(articles.map(a => a.source));

  // Extract country mentions from titles
  const allTitlesLower = articles.map(a => a.title.toLowerCase()).join(' ');
  const countries = COUNTRY_NAMES.filter(c => allTitlesLower.includes(c));

  return {
    articleCount: articles.length,
    avgSentiment: Number(avgSentiment.toFixed(3)),
    sourceCount: sources.size,
    countriesMentioned: countries.length,
    theaterCount,
  };
}

// ─── TRENDING KEYWORDS ──────────────────────────────────────────────────────────

export interface TrendingKeyword {
  word: string;
  count: number;
}

export function extractTrendingKeywords(articles: ConflictArticle[], topN = 20): TrendingKeyword[] {
  const freq: Record<string, number> = {};

  for (const a of articles) {
    const words = a.title
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));

    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

// ─── TIME-AGO UTILITY ───────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
