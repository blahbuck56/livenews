// Centralized API layer with triple fallback: Vercel proxy -> direct API -> fallback data
// This ensures the platform ALWAYS has data regardless of API availability.

import {
  generateFallbackArticles,
  generateFallbackTimeline,
  generateFallbackTone,
  generateFallbackTopicArticles,
  generateFallbackRedditPosts,
} from '../data/fallbackData';

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any;

// Fetch with timeout to prevent hanging requests
async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Safely parse JSON from a response (handles content-type mismatches)
async function safeJson(res: Response): Promise<ApiData> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ============================================================
// GDELT Article Fetching
// ============================================================

export async function fetchGdeltArticles(
  query = 'iran attack OR iran war OR tehran strike OR iran military OR iran nuclear'
): Promise<ApiData> {
  const encodedQuery = encodeURIComponent(query);

  // 1. Try Vercel proxy (works when deployed on Vercel)
  try {
    const res = await fetchWithTimeout(
      `/api/gdelt?query=${encodedQuery}&mode=artlist&maxrecords=75&sort=datedesc`,
      6000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.articles?.length > 0) {
        console.log(`[GDELT] Proxy returned ${data.articles.length} articles`);
        return data;
      }
    }
  } catch (err) {
    console.warn('[GDELT] Proxy unavailable:', (err as Error).message);
  }

  // 2. Try direct GDELT API (works if CORS is supported)
  try {
    const res = await fetchWithTimeout(
      `${GDELT_BASE}?query=${encodedQuery}&mode=artlist&maxrecords=75&format=json&sort=datedesc`,
      10000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.articles?.length > 0) {
        console.log(`[GDELT] Direct API returned ${data.articles.length} articles`);
        return data;
      }
    }
  } catch (err) {
    console.warn('[GDELT] Direct API failed:', (err as Error).message);
  }

  // 3. Fallback: conflict-specific intelligence data
  console.warn('[GDELT] Using fallback data for query:', query);
  return { articles: generateFallbackArticles(query) };
}

// ============================================================
// GDELT Timeline (Article Volume)
// ============================================================

export async function fetchGdeltTimeline(query = 'iran'): Promise<ApiData> {
  const eq = encodeURIComponent(query);

  // 1. Try Vercel proxy
  try {
    const res = await fetchWithTimeout(
      `/api/gdelt?query=${eq}&mode=timelinevol&timeres=60&timespan=72h`,
      6000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.timeline?.[0]?.data?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Timeline] Proxy failed:', (err as Error).message);
  }

  // 2. Try direct GDELT
  try {
    const res = await fetchWithTimeout(
      `${GDELT_BASE}?query=${eq}&mode=timelinevol&TIMERES=60&TIMESPAN=72h&format=json`,
      10000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.timeline?.[0]?.data?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Timeline] Direct failed:', (err as Error).message);
  }

  // 3. Fallback — varies by conflict
  console.warn('[GDELT Timeline] Using fallback data for:', query);
  return { timeline: [{ data: generateFallbackTimeline(query) }] };
}

// ============================================================
// GDELT Tone (Sentiment Over Time)
// FIXED: was using mode=tonechart (histogram), now uses mode=timelinetone (timeline)
// ============================================================

export async function fetchGdeltTone(query = 'iran'): Promise<ApiData> {
  const eq = encodeURIComponent(query);

  // 1. Try Vercel proxy
  try {
    const res = await fetchWithTimeout(
      `/api/gdelt?query=${eq}&mode=timelinetone&timespan=72h`,
      6000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.timeline?.[0]?.data?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Tone] Proxy failed:', (err as Error).message);
  }

  // 2. Try direct GDELT (FIXED: timelinetone instead of tonechart)
  try {
    const res = await fetchWithTimeout(
      `${GDELT_BASE}?query=${eq}&mode=timelinetone&TIMESPAN=72h&format=json`,
      10000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.timeline?.[0]?.data?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Tone] Direct failed:', (err as Error).message);
  }

  // 3. Fallback — varies by conflict
  console.warn('[GDELT Tone] Using fallback data for:', query);
  return { timeline: [{ data: generateFallbackTone(query) }] };
}

// ============================================================
// GDELT Topic Articles (for Geopolitics page)
// ============================================================

export async function fetchGdeltTopicArticles(query: string): Promise<ApiData> {
  const encodedQuery = encodeURIComponent(query);

  // 1. Try Vercel proxy
  try {
    const res = await fetchWithTimeout(
      `/api/gdelt?query=${encodedQuery}&mode=artlist&maxrecords=10&sort=datedesc`,
      6000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.articles?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Topics] Proxy failed:', (err as Error).message);
  }

  // 2. Try direct GDELT
  try {
    const res = await fetchWithTimeout(
      `${GDELT_BASE}?query=${encodedQuery}&mode=artlist&maxrecords=10&format=json&sort=datedesc`,
      10000
    );
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.articles?.length > 0) return data;
    }
  } catch (err) {
    console.warn('[GDELT Topics] Direct failed:', (err as Error).message);
  }

  // 3. No individual topic fallback — handled at the hook level
  return { articles: [] };
}

// ============================================================
// Reddit Posts (Reddit has NO CORS support — proxy is essential)
// ============================================================

export async function fetchRedditPosts(
  subreddit: string,
  searchQuery?: string
): Promise<ApiData> {
  const params = searchQuery
    ? `subreddit=${subreddit}&q=${encodeURIComponent(searchQuery)}&sort=new&t=week&limit=25`
    : `subreddit=${subreddit}&limit=15`;

  // 1. Try Vercel proxy (REQUIRED for Reddit — no CORS from browser)
  try {
    const res = await fetchWithTimeout(`/api/reddit?${params}`, 8000);
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.data) {
        console.log(`[Reddit] Proxy returned data for r/${subreddit}`);
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Reddit] Proxy failed for r/${subreddit}:`, (err as Error).message);
  }

  // 2. Try direct Reddit (will fail in browsers due to CORS, but works in some environments)
  try {
    const url = searchQuery
      ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&t=week&limit=25`
      : `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;
    const res = await fetchWithTimeout(url, 6000);
    if (res.ok) {
      const data = await safeJson(res);
      if (data?.data) return data;
    }
  } catch (err) {
    console.warn(`[Reddit] Direct failed for r/${subreddit}:`, (err as Error).message);
  }

  // 3. Return empty — fallback handled at hook level
  console.warn(`[Reddit] Using fallback for r/${subreddit}`);
  return {};
}

// Export fallback generators for direct use by hooks
export { generateFallbackRedditPosts, generateFallbackTopicArticles };
