import { useQuery } from '@tanstack/react-query';
import { fetchRedditPosts, generateFallbackRedditPosts } from '../lib/api';

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  permalink: string;
  createdUtc: number;
  url: string;
}

function parseRedditResponse(data: Record<string, unknown>): RedditPost[] {
  const listing = data?.data as Record<string, unknown> | undefined;
  const children = (listing?.children || []) as { data: Record<string, unknown> }[];
  return children
    .filter((child) => child?.data?.title)
    .map((child) => ({
      id: (child.data.id as string) || String(Math.random()),
      title: child.data.title as string,
      subreddit: (child.data.subreddit as string) || 'unknown',
      score: (child.data.score as number) || 0,
      numComments: (child.data.num_comments as number) || 0,
      permalink: `https://www.reddit.com${child.data.permalink || ''}`,
      createdUtc: (child.data.created_utc as number) || Date.now() / 1000,
      url: (child.data.url as string) || '',
    }));
}

export function useRedditFeed() {
  return useQuery({
    queryKey: ['reddit-feed'],
    queryFn: async (): Promise<RedditPost[]> => {
      // Try fetching from all 3 subreddits
      const [worldnews, iran, geopolitics] = await Promise.all([
        fetchRedditPosts('worldnews', 'iran war').then(parseRedditResponse).catch(() => []),
        fetchRedditPosts('iran').then(parseRedditResponse).catch(() => []),
        fetchRedditPosts('geopolitics', 'iran').then(parseRedditResponse).catch(() => []),
      ]);

      const liveResults = [...worldnews, ...iran, ...geopolitics];

      // If we got live data, use it
      if (liveResults.length > 0) {
        return liveResults.sort((a, b) => b.createdUtc - a.createdUtc);
      }

      // Otherwise, use comprehensive fallback data
      return generateFallbackRedditPosts();
    },
    refetchInterval: 3 * 60 * 1000,
    staleTime: 60 * 1000,
    retry: 2,
  });
}
