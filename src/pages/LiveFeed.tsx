import { useState, useMemo } from 'react';
import { useCombinedNews } from '../hooks/useNews';
import { timeAgo, isBreaking } from '../utils/time';
import { extractKeywords } from '../utils/keywords';
import { FeedSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

const sourceCategories = [
  'Wire Services', 'Western Media', 'Middle East Media',
  'Independent', 'State Media', 'OSINT', 'Social',
];

const quickLinks = [
  { name: 'Liveuamap Iran', url: 'https://iran.liveuamap.com' },
  { name: 'Iran Monitor OSINT', url: 'https://iranmonitor.org' },
  { name: 'NetBlocks', url: 'https://netblocks.org' },
  { name: 'Flightradar24', url: 'https://www.flightradar24.com' },
  { name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov' },
];

const liveTvStreams = [
  { name: 'Al Jazeera', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', channel: 'Al Jazeera English' },
  { name: 'Sky News', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', channel: 'Sky News' },
  { name: 'France 24', url: 'https://www.youtube.com/watch?v=Ap-UM1O9RBk', channel: 'France 24 English' },
];

const situationData = [
  { label: 'Conflict Status', value: 'ACTIVE — Operation Epic Fury', color: '#DC2626' },
  { label: 'Iran Internet', value: 'Partial Shutdown', color: '#D97706' },
  { label: 'Airspace', value: 'Closed — Western Iran', color: '#DC2626' },
  { label: 'Strait of Hormuz', value: 'Restricted Navigation', color: '#D97706' },
  { label: 'US DEFCON', value: 'Elevated Readiness', color: '#D97706' },
  { label: 'Iran Nuclear Sites', value: 'Under Strike Assessment', color: '#DC2626' },
];

export default function LiveFeed() {
  const { articles, isLoading, isError, refetch } = useCombinedNews();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [breakingOnly, setBreakingOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [mobileDrawer, setMobileDrawer] = useState<'left' | 'right' | null>(null);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (breakingOnly) {
      result = result.filter((a) => isBreaking(a.publishedAt));
    }
    return result;
  }, [articles, activeFilters, breakingOnly]);

  const trendingKeywords = useMemo(() => {
    return extractKeywords(articles.map((a) => a.title), 15);
  }, [articles]);

  const toggleFilter = (cat: string) => {
    const next = new Set(activeFilters);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setActiveFilters(next);
  };

  const leftSidebar = (
    <div className="space-y-4">
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Source Filters</h3>
        <div className="space-y-2">
          {sourceCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.has(cat)}
                onChange={() => toggleFilter(cat)}
                className="w-3.5 h-3.5 rounded accent-[#111827]"
              />
              <span className="text-xs text-[#374151]">{cat}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={breakingOnly}
              onChange={() => setBreakingOnly(!breakingOnly)}
              className="w-3.5 h-3.5 rounded accent-[#DC2626]"
            />
            <span className="text-xs text-[#DC2626] font-medium">Breaking Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  const rightSidebar = (
    <div className="space-y-4">
      {/* Situation Status */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Situation Status</h3>
        <div className="space-y-2">
          {situationData.map((item) => (
            <div key={item.label} className="flex justify-between items-start gap-2">
              <span className="text-[11px] text-[#6B7280]">{item.label}</span>
              <span className="text-[11px] font-medium text-right" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-[#E5E7EB]">
          <span className="text-[10px] font-mono text-[#9CA3AF]">Last Updated: {new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Trending Topics</h3>
        <div className="flex flex-wrap gap-1.5">
          {trendingKeywords.map((kw) => (
            <span key={kw.word} className="px-2 py-0.5 text-[10px] bg-[#F3F4F6] text-[#374151] rounded" style={{ borderRadius: '3px' }}>
              {kw.word} <span className="text-[#9CA3AF]">{kw.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="space-y-1.5">
          {quickLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#2563EB] hover:underline no-underline">
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Live TV */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
        <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Live TV</h3>
        <div className="space-y-2">
          {liveTvStreams.map((stream) => (
            <a key={stream.name} href={stream.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border border-[#E5E7EB] rounded hover:bg-[#F9FAFB] no-underline" style={{ borderRadius: '4px' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse-dot" />
              <div>
                <div className="text-xs font-medium text-[#111827]">{stream.name}</div>
                <div className="text-[10px] text-[#9CA3AF]">{stream.channel}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4">
      {/* Mobile drawer toggles */}
      <div className="lg:hidden flex gap-2 mb-3">
        <button onClick={() => setMobileDrawer(mobileDrawer === 'left' ? null : 'left')} className="text-xs px-3 py-1.5 border border-[#E5E7EB] rounded bg-white text-[#374151] cursor-pointer" style={{ borderRadius: '4px' }}>
          Filters
        </button>
        <button onClick={() => setMobileDrawer(mobileDrawer === 'right' ? null : 'right')} className="text-xs px-3 py-1.5 border border-[#E5E7EB] rounded bg-white text-[#374151] cursor-pointer" style={{ borderRadius: '4px' }}>
          Widgets
        </button>
      </div>

      {/* Mobile drawer content */}
      {mobileDrawer === 'left' && <div className="lg:hidden mb-4">{leftSidebar}</div>}
      {mobileDrawer === 'right' && <div className="lg:hidden mb-4">{rightSidebar}</div>}

      <div className="flex gap-4">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          {leftSidebar}
        </aside>

        {/* Center Feed */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#111827]">Live News Feed</h2>
            <span className="text-[10px] font-mono text-[#9CA3AF]">{filteredArticles.length} articles</span>
          </div>

          {isLoading && <FeedSkeleton count={8} />}
          {isError && <ErrorState message="Failed to fetch news articles" onRetry={refetch} />}

          {!isLoading && !isError && (
            <div className="space-y-3">
              {filteredArticles.slice(0, visibleCount).map((article) => {
                const breaking = isBreaking(article.publishedAt);
                return (
                  <article
                    key={article.id}
                    className={`bg-white border border-[#E5E7EB] rounded-[6px] p-4 ${
                      breaking ? 'border-l-[3px] border-l-[#DC2626] bg-[#FEF2F2]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-medium text-[#6B7280] uppercase">{article.source}</span>
                      <span className="text-[11px] font-mono text-[#9CA3AF]">{timeAgo(article.publishedAt)}</span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                      <h3 className="text-[15px] font-semibold text-[#111827] leading-snug mb-1 hover:text-[#2563EB]">
                        {article.title}
                      </h3>
                    </a>
                    {article.description && (
                      <p className="text-[13px] text-[#6B7280] line-clamp-2 mb-2">{article.description}</p>
                    )}
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt=""
                        className="w-full h-40 object-cover rounded mb-2"
                        style={{ borderRadius: '4px' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            tag === 'BREAKING'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : tag === 'DEVELOPING'
                                ? 'bg-[#FEF3C7] text-[#D97706]'
                                : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                          style={{ borderRadius: '3px' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}

              {visibleCount < filteredArticles.length && (
                <button
                  onClick={() => setVisibleCount((c) => c + 20)}
                  className="w-full py-2.5 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded bg-white hover:bg-[#F9FAFB] cursor-pointer"
                  style={{ borderRadius: '6px' }}
                >
                  Load more ({filteredArticles.length - visibleCount} remaining)
                </button>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-[320px] shrink-0">
          {rightSidebar}
        </aside>
      </div>
    </div>
  );
}
