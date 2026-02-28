import Sentiment from 'sentiment';

const analyzer = new Sentiment();

export interface SentimentResult {
  score: number;
  comparative: number;
  positive: string[];
  negative: string[];
}

export function analyzeSentiment(text: string): SentimentResult {
  const result = analyzer.analyze(text);
  return {
    score: result.score,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative,
  };
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
