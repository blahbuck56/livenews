import { useQuery } from '@tanstack/react-query';
import { fetchRedditPosts } from '../lib/api';

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

function parseRedditResponse(data: { data?: { children?: { data: Record<string, unknown> }[] } }): RedditPost[] {
  return (data.data?.children || []).map((child) => ({
    id: child.data.id as string,
    title: child.data.title as string,
    subreddit: child.data.subreddit as string,
    score: child.data.score as number,
    numComments: child.data.num_comments as number,
    permalink: `https://www.reddit.com${child.data.permalink}`,
    createdUtc: child.data.created_utc as number,
    url: child.data.url as string,
  }));
}

export function useRedditFeed() {
  return useQuery({
    queryKey: ['reddit-feed'],
    queryFn: async () => {
      const [worldnews, iran, geopolitics] = await Promise.all([
        fetchRedditPosts('worldnews', 'iran war').then(parseRedditResponse).catch(() => []),
        fetchRedditPosts('iran').then(parseRedditResponse).catch(() => []),
        fetchRedditPosts('geopolitics', 'iran').then(parseRedditResponse).catch(() => []),
      ]);
      return [...worldnews, ...iran, ...geopolitics]
        .sort((a, b) => b.createdUtc - a.createdUtc);
    },
    refetchInterval: 3 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}
