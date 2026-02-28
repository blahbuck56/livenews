export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  sourceDomain?: string;
  publishedAt: string;
  sentiment?: number;
  tags: string[];
  category?: string;
}

export interface GdeltArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  permalink: string;
  createdUtc: number;
  url: string;
  selftext?: string;
}

export interface SourceInfo {
  name: string;
  url: string;
  category: SourceCategory;
  bias: BiasTag;
  country: string;
  type: SourceType;
  status: 'Live' | 'Active' | 'Intermittent';
  description: string;
  twitterHandle?: string;
}

export type SourceCategory =
  | 'Wire Service'
  | 'Live Blog'
  | 'TV'
  | 'Middle East & Regional'
  | 'Independent & Diaspora'
  | 'YouTube Live'
  | 'OSINT & Tools'
  | 'State Media'
  | 'Think Tank'
  | 'Twitter/X'
  | 'Subreddit';

export type BiasTag =
  | 'Neutral'
  | 'Western'
  | 'Regional'
  | 'State'
  | 'Independent'
  | 'OSINT'
  | 'Israeli'
  | 'Opposition';

export type SourceType =
  | 'Website'
  | 'Live Blog'
  | 'YouTube'
  | 'Twitter'
  | 'OSINT Tool'
  | 'Think Tank'
  | 'Subreddit';

export interface StrikeLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
  timestamp?: string;
}

export interface SentimentData {
  time: string;
  score: number;
  count: number;
}

export interface VideoStream {
  id: string;
  title: string;
  channel: string;
  youtubeId: string;
  isLive: boolean;
  biasTag: BiasTag;
  description: string;
  primary?: boolean;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}
