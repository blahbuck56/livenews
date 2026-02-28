import { stopwords } from '../data/stopwords';

export function extractKeywords(headlines: string[], limit = 25): { word: string; count: number }[] {
  const freq: Record<string, number> = {};
  for (const headline of headlines) {
    const words = headline.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && !stopwords.has(word)) {
        freq[word] = (freq[word] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function extractEntities(texts: string[]): { name: string; count: number; type: 'person' | 'org' | 'location' }[] {
  const entityFreq: Record<string, { count: number; type: 'person' | 'org' | 'location' }> = {};

  const knownLocations = ['Iran', 'Tehran', 'Isfahan', 'Israel', 'Gaza', 'Iraq', 'Syria', 'Lebanon', 'Yemen', 'Saudi Arabia', 'Qatar', 'UAE', 'Bahrain', 'Turkey', 'Russia', 'China', 'Europe', 'Geneva', 'Washington', 'Pentagon', 'Strait of Hormuz', 'Persian Gulf', 'Qom', 'Tabriz', 'Karaj', 'Kermanshah', 'Yazd', 'United States', 'United Kingdom'];
  const knownOrgs = ['IRGC', 'IDF', 'NATO', 'UN', 'EU', 'Pentagon', 'Hezbollah', 'Hamas', 'Houthis', 'White House', 'Congress', 'Senate', 'Security Council', 'IAEA', 'CIA', 'Mossad'];
  const knownPeople = ['Trump', 'Biden', 'Khamenei', 'Netanyahu', 'Raisi', 'Blinken', 'Sullivan', 'Gallant', 'Austin', 'Macron', 'Putin', 'Erdogan', 'Scholz'];

  for (const text of texts) {
    for (const loc of knownLocations) {
      if (text.includes(loc)) {
        entityFreq[loc] = entityFreq[loc] || { count: 0, type: 'location' };
        entityFreq[loc].count++;
      }
    }
    for (const org of knownOrgs) {
      if (text.includes(org)) {
        entityFreq[org] = entityFreq[org] || { count: 0, type: 'org' };
        entityFreq[org].count++;
      }
    }
    for (const person of knownPeople) {
      if (text.includes(person)) {
        entityFreq[person] = entityFreq[person] || { count: 0, type: 'person' };
        entityFreq[person].count++;
      }
    }
  }

  return Object.entries(entityFreq)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);
}
