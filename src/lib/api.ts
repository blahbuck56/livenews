// Centralized API calls

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

export async function fetchGdeltArticles(query = 'iran+attack+OR+iran+war+OR+tehran+strike') {
  const url = `${GDELT_BASE}?query=${query}&mode=artlist&maxrecords=75&format=json&sort=datedesc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GDELT artlist failed: ${res.status}`);
  return res.json();
}

export async function fetchGdeltTimeline() {
  const url = `${GDELT_BASE}?query=iran&mode=timelinevol&TIMERES=60&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GDELT timeline failed: ${res.status}`);
  return res.json();
}

export async function fetchGdeltTone() {
  const url = `${GDELT_BASE}?query=iran&mode=tonechart&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GDELT tone failed: ${res.status}`);
  return res.json();
}

export async function fetchGdeltTopicArticles(query: string) {
  const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json&sort=datedesc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GDELT topic failed: ${res.status}`);
  return res.json();
}

export async function fetchRedditPosts(subreddit: string, searchQuery?: string) {
  const url = searchQuery
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&t=day&limit=25`
    : `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status}`);
  return res.json();
}
