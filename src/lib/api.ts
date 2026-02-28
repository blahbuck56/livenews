// Centralized API calls

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

async function safeFetch(url: string, label: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} failed: ${res.status} ${res.statusText}`);
  // Ensure response is JSON (GDELT sometimes returns HTML errors)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('json') && !contentType.includes('javascript')) {
    // Try to parse anyway — some APIs don't set content-type correctly
    const text = await res.text();
    try {
      return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch {
      throw new Error(`${label}: unexpected response format`);
    }
  }
  return res;
}

export async function fetchGdeltArticles(query = 'iran+attack+OR+iran+war+OR+tehran+strike') {
  const url = `${GDELT_BASE}?query=${query}&mode=artlist&maxrecords=75&format=json&sort=datedesc`;
  const res = await safeFetch(url, 'GDELT artlist');
  return res.json();
}

export async function fetchGdeltTimeline() {
  const url = `${GDELT_BASE}?query=iran&mode=timelinevol&TIMERES=60&TIMESPAN=72h&format=json`;
  const res = await safeFetch(url, 'GDELT timeline');
  return res.json();
}

export async function fetchGdeltTone() {
  const url = `${GDELT_BASE}?query=iran&mode=tonechart&TIMESPAN=72h&format=json`;
  const res = await safeFetch(url, 'GDELT tone');
  return res.json();
}

export async function fetchGdeltTopicArticles(query: string) {
  const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json&sort=datedesc`;
  const res = await safeFetch(url, 'GDELT topic');
  return res.json();
}

export async function fetchRedditPosts(subreddit: string, searchQuery?: string) {
  const url = searchQuery
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&t=week&limit=25`
    : `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status}`);
  return res.json();
}
