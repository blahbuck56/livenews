import { useState, useMemo, useEffect } from 'react';
import { useCombinedNews } from '../hooks/useGdeltArticles';
import { extractKeywords } from '../lib/keywords';
import { FeedSkeleton } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import SectionHeader from '../components/common/SectionHeader';
import BiasTag from '../components/common/BiasTag';

const categories = ['Wire', 'Western', 'Regional', 'Independent', 'State', 'OSINT'];
const quickLinks = [
  { name: 'Liveuamap Iran', url: 'https://iran.liveuamap.com', color: '#7C3AED' },
  { name: 'Iran Monitor', url: 'https://iranmonitor.org', color: '#7C3AED' },
  { name: 'NetBlocks', url: 'https://netblocks.org', color: '#16A34A' },
  { name: 'Flightradar24', url: 'https://www.flightradar24.com', color: '#2563EB' },
  { name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov', color: '#DC2626' },
];
const liveTv = [
  { name: 'Al Jazeera EN', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', bias: 'regional' },
  { name: 'Sky News', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', bias: 'western' },
  { name: 'France 24', url: 'https://www.youtube.com/watch?v=Ap-UM1O9RBk', bias: 'neutral' },
];
const situationStatus = [
  { label: 'Conflict', value: 'ACTIVE COMBAT', color: '#DC2626' },
  { label: 'Iran Net', value: '4% BLACKOUT', color: '#DC2626' },
  { label: 'Iran Air', value: 'CLOSED', color: '#DC2626' },
  { label: 'Gulf Air', value: 'QA/KW/AE CLOSED', color: '#DC2626' },
  { label: 'Israel', value: 'EMERGENCY', color: '#DC2626' },
  { label: 'U.S. Op', value: 'Epic Fury', color: '#111827' },
  { label: 'IDF Op', value: 'Roar of the Lion', color: '#111827' },
  { label: 'Duration', value: 'Multi-Day', color: '#D97706' },
];

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LiveFeed() {
  const { articles, isLoading, isError, refetch } = useCombinedNews();
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [breakingOnly, setBreakingOnly] = useState(false);
  const [hasImageOnly, setHasImageOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [mobileDrawer, setMobileDrawer] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { setSecondsAgo(0); }, [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (breakingOnly) list = list.filter((a) => a.tags.includes('BREAKING'));
    if (hasImageOnly) list = list.filter((a) => a.imageUrl);
    return list;
  }, [articles, filters, breakingOnly, hasImageOnly]);

  const trending = useMemo(() => extractKeywords(articles.map((a) => a.title), 15), [articles]);

  const toggleFilter = (c: string) => {
    const n = new Set(filters);
    n.has(c) ? n.delete(c) : n.add(c);
    setFilters(n);
  };

  const leftSidebar = (
    <div className="space-y-4">
      <div className="card p-3">
        <SectionHeader>Source Filters</SectionHeader>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded-[3px] transition-colors">
              <input type="checkbox" checked={filters.has(c)} onChange={() => toggleFilter(c)} className="w-3.5 h-3.5 accent-[#111827]" />
              <span className="text-[12px] text-[#374151]">{c}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={breakingOnly} onChange={() => setBreakingOnly(!breakingOnly)} className="w-3.5 h-3.5 accent-[#DC2626]" />
            <span className="text-[12px] font-medium text-[#DC2626]">Breaking Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasImageOnly} onChange={() => setHasImageOnly(!hasImageOnly)} className="w-3.5 h-3.5 accent-[#111827]" />
            <span className="text-[12px] text-[#374151]">Has Image</span>
          </label>
        </div>
      </div>
    </div>
  );

  const rightSidebar = (
    <div className="space-y-4">
      <div className="card p-3">
        <SectionHeader>Situation Status</SectionHeader>
        <div className="space-y-1.5">
          {situationStatus.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[11px] text-[#6B7280]">{item.label}</span>
              <span className="font-mono text-[12px] font-medium" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-3">
        <SectionHeader>Trending</SectionHeader>
        <div className="space-y-1">
          {trending.map((kw, i) => (
            <div key={kw.word} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#9CA3AF] w-4">{i + 1}</span>
              <span className="text-[11px] text-[#374151] flex-1">{kw.word}</span>
              <div className="h-1.5 rounded-[2px]" style={{ width: `${Math.min(100, (kw.count / (trending[0]?.count || 1)) * 60)}px`, backgroundColor: '#2563EB', opacity: 0.7 }} />
              <span className="text-[10px] font-mono text-[#9CA3AF] w-5 text-right">{kw.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-3">
        <SectionHeader>Quick Links</SectionHeader>
        <div className="space-y-1.5">
          {quickLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline hover:bg-gray-50 px-1 py-1 rounded-[3px] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: link.color }} />
              <span className="text-[12px] text-[#2563EB]">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="card p-3">
        <SectionHeader>Live TV</SectionHeader>
        <div className="space-y-2">
          {liveTv.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded-[4px] hover:bg-gray-50 no-underline transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse-dot" />
              <span className="text-[12px] font-medium text-[#111827] flex-1">{s.name}</span>
              <BiasTag bias={s.bias} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4">
      <div className="lg:hidden flex gap-2 mb-3">
        <button onClick={() => setMobileDrawer(mobileDrawer === 'left' ? null : 'left')} className="text-[11px] px-3 py-1.5 border bg-white text-[#374151] cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors">Filters</button>
        <button onClick={() => setMobileDrawer(mobileDrawer === 'right' ? null : 'right')} className="text-[11px] px-3 py-1.5 border bg-white text-[#374151] cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors">Widgets</button>
      </div>
      {mobileDrawer === 'left' && <div className="lg:hidden mb-4">{leftSidebar}</div>}
      {mobileDrawer === 'right' && <div className="lg:hidden mb-4">{rightSidebar}</div>}

      <div className="flex gap-4">
        <aside className="hidden lg:block w-[280px] shrink-0">{leftSidebar}</aside>
        <main className="flex-1 min-w-0">
          <div className="sticky top-[58px] z-20 bg-[#F8F9FA] pb-2 pt-1 flex items-center justify-between">
            <span className="section-header">LIVE FEED</span>
            <span className="font-mono text-[11px] text-[#DC2626]">Updated {secondsAgo}s ago</span>
          </div>

          {isLoading && <FeedSkeleton count={8} />}
          {isError && <ErrorState message="Failed to fetch news from GDELT" onRetry={refetch} />}
          {!isLoading && !isError && (
            <div className="space-y-3">
              {filtered.slice(0, visibleCount).map((article) => {
                const isBreaking = article.tags.includes('BREAKING');
                const isDeveloping = article.tags.includes('DEVELOPING');
                return (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
                    className={`card block p-4 no-underline transition-all hover:bg-[#F9FAFB] ${isBreaking ? 'border-l-[3px] border-l-[#DC2626] !bg-[#FEF2F2]' : isDeveloping ? 'border-l-[3px] border-l-[#D97706] !bg-[#FFFBEB]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' as const }}>{article.source}</span>
                          <span className="font-mono text-[11px] text-[#9CA3AF]">{timeAgo(article.publishedAt)}</span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', lineHeight: '1.3', margin: '0 0 4px 0' }}>{article.title}</h3>
                        {article.description && <p className="line-clamp-2" style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.55', margin: 0 }}>{article.description}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {article.tags.map((tag) => (
                            <span key={tag} style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}
                              className={tag === 'BREAKING' ? 'bg-red-50 text-red-700' : tag === 'DEVELOPING' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {article.imageUrl && (
                        <img src={article.imageUrl} alt="" className="w-20 h-[60px] object-cover rounded-[4px] shrink-0 mt-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      )}
                    </div>
                  </a>
                );
              })}
              {visibleCount < filtered.length && (
                <button onClick={() => setVisibleCount((c) => c + 20)} className="w-full py-2.5 text-[12px] font-medium text-[#6B7280] border bg-white hover:bg-gray-50 cursor-pointer rounded-[6px] transition-colors">
                  Load more ({filtered.length - visibleCount} remaining)
                </button>
              )}
            </div>
          )}
        </main>
        <aside className="hidden lg:block w-[320px] shrink-0">{rightSidebar}</aside>
      </div>
    </div>
  );
}
