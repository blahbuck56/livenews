import Sentiment from 'sentiment';

let analyzer: Sentiment | null = null;
try {
  analyzer = new Sentiment();
} catch {
  // Sentiment package failed to initialize — will use fallback
}

export interface SentimentResult {
  score: number;
  comparative: number;
  positive: string[];
  negative: string[];
}

export function analyzeSentiment(text: string): SentimentResult {
  if (!analyzer) {
    return { score: 0, comparative: 0, positive: [], negative: [] };
  }
  try {
    const result = analyzer.analyze(text);
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
    };
  } catch {
    return { score: 0, comparative: 0, positive: [], negative: [] };
  }
}

export function getSentimentColor(comparative: number): string {
  if (comparative > 0.5) return '#16A34A';
  if (comparative < -0.5) return '#DC2626';
  return '#D97706';
}

export function getSentimentLabel(comparative: number): string {
  if (comparative > 0.5) return 'Positive';
  if (comparative < -0.5) return 'Negative';
  return 'Neutral';
}
