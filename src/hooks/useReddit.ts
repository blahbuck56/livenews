import { useQuery } from '@tanstack/react-query';
import type { RedditPost } from '../types';

async function fetchRedditPosts(subreddit: string, searchQuery?: string): Promise<RedditPost[]> {
  try {
    const url = searchQuery
      ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&sort=new&t=day&limit=25`
      : `https://www.reddit.com/r/${subreddit}/new.json?limit=15`;

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status}`);
    const data = await res.json();

    return (data.data?.children || []).map((child: { data: Record<string, unknown> }) => ({
      id: child.data.id as string,
      title: child.data.title as string,
      subreddit: child.data.subreddit as string,
      score: child.data.score as number,
      numComments: child.data.num_comments as number,
      permalink: `https://www.reddit.com${child.data.permalink}`,
      createdUtc: child.data.created_utc as number,
      url: child.data.url as string,
      selftext: (child.data.selftext as string)?.slice(0, 200),
    }));
  } catch {
    return [];
  }
}

export function useRedditFeed() {
  return useQuery({
    queryKey: ['reddit-feed'],
    queryFn: async () => {
      const [worldnews, iran, geopolitics] = await Promise.all([
        fetchRedditPosts('worldnews', 'iran war'),
        fetchRedditPosts('iran'),
        fetchRedditPosts('geopolitics', 'iran'),
      ]);

      return [...worldnews, ...iran, ...geopolitics]
        .sort((a, b) => b.createdUtc - a.createdUtc);
    },
    refetchInterval: 3 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}
