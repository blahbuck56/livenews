const stopwords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'not', 'no', 'nor', 'so',
  'yet', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'than', 'too', 'very', 'just', 'about', 'above', 'after', 'again',
  'all', 'also', 'any', 'because', 'before', 'between', 'down', 'during',
  'even', 'first', 'get', 'got', 'into', 'its', 'it', 'like', 'make',
  'many', 'much', 'new', 'now', 'only', 'out', 'over', 'own', 'same',
  'she', 'her', 'him', 'his', 'how', 'its', 'let', 'me', 'my', 'off',
  'our', 'said', 'say', 'says', 'that', 'their', 'them', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'under', 'until', 'up',
  'upon', 'us', 'we', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'you', 'your', 'he', 'as', 'if', 'one', 'two', 'being',
  'after', 'news', 'report', 'reports', 'according', 'latest', 'update',
  'updates', 'live', 'breaking',
]);

export function extractKeywords(headlines: string[], limit = 30): { word: string; count: number }[] {
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

  const knownLocations = new Set([
    'Iran', 'Tehran', 'Isfahan', 'Israel', 'Gaza', 'Iraq', 'Syria',
    'Lebanon', 'Yemen', 'Saudi Arabia', 'Qatar', 'UAE', 'Bahrain',
    'Turkey', 'Russia', 'China', 'Europe', 'Geneva', 'Washington',
    'Pentagon', 'Strait of Hormuz', 'Persian Gulf', 'Qom', 'Tabriz',
    'Karaj', 'Kermanshah', 'Yazd', 'United States', 'United Kingdom',
  ]);

  const knownOrgs = new Set([
    'IRGC', 'IDF', 'NATO', 'UN', 'EU', 'Pentagon', 'Hezbollah',
    'Hamas', 'Houthis', 'White House', 'Congress', 'Senate',
    'Security Council', 'IAEA', 'CIA', 'Mossad',
  ]);

  const knownPeople = new Set([
    'Trump', 'Biden', 'Khamenei', 'Netanyahu', 'Raisi',
    'Blinken', 'Sullivan', 'Gallant', 'Austin', 'Macron',
    'Putin', 'Erdogan', 'Scholz',
  ]);

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
