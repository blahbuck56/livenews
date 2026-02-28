export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const subreddit = url.searchParams.get('subreddit') || 'worldnews';
  const q = url.searchParams.get('q') || '';
  const sort = url.searchParams.get('sort') || 'new';
  const t = url.searchParams.get('t') || 'week';
  const limit = url.searchParams.get('limit') || '25';

  const redditUrl = q
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(q)}&sort=${sort}&t=${t}&limit=${limit}&restrict_sr=1`
    : `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=180, stale-while-revalidate=60',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(redditUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'IranConflictIntel/2.0 (Vercel Edge; news aggregator)' },
    });
    clearTimeout(timeout);
    const text = await res.text();
    return new Response(text, { status: res.status, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Reddit proxy timeout' }), {
      status: 502,
      headers,
    });
  }
}
