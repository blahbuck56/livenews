function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

export function deduplicateArticles<T extends { title: string }>(
  articles: T[],
  threshold = 0.6
): T[] {
  const result: T[] = [];
  const tokenCache: Set<string>[] = [];

  for (const article of articles) {
    const tokens = tokenize(article.title);
    let isDuplicate = false;
    for (const cached of tokenCache) {
      if (jaccard(tokens, cached) > threshold) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      result.push(article);
      tokenCache.push(tokens);
    }
  }

  return result;
}
