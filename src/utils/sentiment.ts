// AFINN-165 inspired word list for conflict-related sentiment analysis
const positiveWords: Record<string, number> = {
  peace: 3, ceasefire: 3, agreement: 2, diplomatic: 2, negotiate: 2,
  negotiations: 2, talks: 1, dialogue: 2, humanitarian: 1, aid: 1,
  rescue: 2, safe: 2, stability: 2, protect: 1, resolved: 2,
  cooperation: 2, truce: 3, calm: 2, 'de-escalation': 3, deescalation: 3,
  hope: 2, relief: 2, withdraw: 1, withdrawal: 1, support: 1,
  defend: 1, liberation: 2, success: 2, victory: 1, progress: 1,
  rebuild: 2, recovery: 2, evacuate: 1, survive: 1, survivors: 1,
};

const negativeWords: Record<string, number> = {
  war: -3, attack: -3, strikes: -2, strike: -2, bombing: -3, bomb: -3,
  killed: -3, dead: -3, death: -3, deaths: -3, die: -3, died: -3,
  casualties: -3, casualty: -3, wounded: -2, injured: -2, destroy: -3,
  destroyed: -3, destruction: -3, missile: -2, missiles: -2, rocket: -2,
  rockets: -2, explosion: -3, exploded: -3, conflict: -2, crisis: -2,
  threat: -2, threaten: -2, invasion: -3, invade: -3, escalation: -2,
  escalate: -2, retaliation: -2, retaliate: -2, hostile: -2, terror: -3,
  terrorism: -3, terrorist: -3, sanctions: -1, collapse: -2, nuclear: -1,
  weapons: -1, military: -1, siege: -2, blockade: -2, flee: -2,
  refugees: -2, displaced: -2, devastation: -3, catastrophe: -3,
  emergency: -2, danger: -2, dangerous: -2, chaos: -2, violent: -3,
  violence: -3, bloodshed: -3, massacre: -3, assassination: -3, drone: -1,
  airstrike: -3, airstrikes: -3, shelling: -3, troops: -1, combat: -2,
  fury: -2, rage: -2, fire: -1, burns: -2, burning: -2,
};

export function analyzeSentiment(text: string): number {
  const words = text.toLowerCase().replace(/[^a-z\s-]/g, '').split(/\s+/);
  let score = 0;
  let wordCount = 0;

  for (const word of words) {
    if (positiveWords[word] !== undefined) {
      score += positiveWords[word];
      wordCount++;
    }
    if (negativeWords[word] !== undefined) {
      score += negativeWords[word];
      wordCount++;
    }
  }

  if (wordCount === 0) return 0;
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score / (wordCount * 2)));
}

export function getSentimentLabel(score: number): string {
  if (score > 0.2) return 'Positive';
  if (score < -0.2) return 'Negative';
  return 'Neutral';
}

export function getSentimentColor(score: number): string {
  if (score > 0.2) return '#16A34A';
  if (score < -0.2) return '#DC2626';
  return '#D97706';
}
