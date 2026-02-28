import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRedditFeed } from '../hooks/useRedditFeed';
import { useCombinedNews } from '../hooks/useGdeltArticles';
import { analyzeSentiment, getSentimentColor } from '../lib/sentiment';
import { FeedSkeleton } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import SectionHeader from '../components/common/SectionHeader';
import BiasTag from '../components/common/BiasTag';

const twitterAccounts = [
  { handle: 'Reuters', name: 'Reuters', bias: 'neutral' },
  { handle: 'AP', name: 'Associated Press', bias: 'neutral' },
  { handle: 'AJEnglish', name: 'Al Jazeera English', bias: 'regional' },
  { handle: 'BBCBreaking', name: 'BBC Breaking', bias: 'neutral' },
  { handle: 'IranIntl_En', name: 'Iran International', bias: 'opposition' },
  { handle: 'sentdefender', name: 'OSINT Defender', bias: 'osint' },
  { handle: 'OSINTWarfare', name: 'OSINT Warfare', bias: 'osint' },
  { handle: 'Osint613', name: 'Osint613', bias: 'osint' },
  { handle: 'netblocks', name: 'NetBlocks', bias: 'osint' },
  { handle: 'TheStudyofWar', name: 'ISW', bias: 'western' },
  { handle: 'Joyce_Karam', name: 'Joyce Karam', bias: 'independent' },
  { handle: 'BarakRavid', name: 'Barak Ravid', bias: 'israeli' },
  { handle: 'NatashaBertrand', name: 'Natasha Bertrand', bias: 'western' },
  { handle: 'JackDetsch', name: 'Jack Detsch', bias: 'western' },
  { handle: 'Ali_Vaez', name: 'Ali Vaez', bias: 'independent' },
  { handle: 'IranWire', name: 'IranWire', bias: 'opposition' },
];

const telegramChannels = [
  { name: 'Tasnim News Agency', description: 'IRGC-linked, primary for official Iranian military statements', bias: 'state' },
  { name: 'Fars News Agency', description: 'Semi-official Iranian news, hardline perspective', bias: 'state' },
  { name: 'Iran International', description: 'London-based, critical of Iranian regime', bias: 'opposition' },
  { name: 'NetBlocks', description: 'Internet connectivity and censorship monitoring', bias: 'osint' },
  { name: 'OSINT Aggregators', description: 'Open source intelligence collection channels', bias: 'osint' },
];

const subredditColors: Record<string, string> = { worldnews: 'bg-blue-50 text-blue-700', iran: 'bg-amber-50 text-amber-700', geopolitics: 'bg-teal-50 text-teal-700' };

type Tab = 'twitter' | 'reddit' | 'telegram';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() / 1000) - ts);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SocialPulse() {
  const [activeTab, setActiveTab] = useState<Tab>('reddit');
  const reddit = useRedditFeed();
  const { articles } = useCombinedNews();

  const sentimentStats = useMemo(() => {
    const scores = articles.map((a) => a.sentiment);
    if (!scores.length) return { avg: 0, positive: 0, negative: 0, neutral: 0 };
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      avg,
      positive: scores.filter((s) => s > 0.5).length,
      negative: scores.filter((s) => s < -0.5).length,
      neutral: scores.filter((s) => s >= -0.5 && s <= 0.5).length,
    };
  }, [articles]);

  const topPositive = useMemo(() => [...articles].sort((a, b) => b.sentiment - a.sentiment).slice(0, 3), [articles]);
  const topNegative = useMemo(() => [...articles].sort((a, b) => a.sentiment - b.sentiment).slice(0, 3), [articles]);

  const sentimentOverTime = useMemo(() => {
    const buckets: Record<string, { sum: number; count: number }> = {};
    for (const a of articles) {
      const hour = a.publishedAt.slice(0, 13);
      if (!buckets[hour]) buckets[hour] = { sum: 0, count: 0 };
      buckets[hour].sum += a.sentiment;
      buckets[hour].count++;
    }
    return Object.entries(buckets).map(([h, d]) => ({ hour: h.slice(11, 13) + ':00', sentiment: +(d.sum / d.count).toFixed(2) })).slice(-24);
  }, [articles]);

  // Gauge calculations
  const gaugeValue = Math.round(sentimentStats.avg * 100);
  const gaugeAngle = 180 * ((gaugeValue + 100) / 200); // map -100..100 to 0..180 degrees

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4">
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px' }}>Social Pulse</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Social Feed */}
        <div className="lg:col-span-3">
          <div className="flex border-b mb-4">
            {(['twitter', 'reddit', 'telegram'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 bg-transparent cursor-pointer transition-colors ${activeTab === tab ? 'border-[#DC2626] text-[#111827]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
                {tab === 'twitter' ? 'Twitter/X' : tab === 'reddit' ? 'Reddit' : 'Telegram'}
              </button>
            ))}
          </div>

          {activeTab === 'twitter' && (
            <div className="card p-4">
              <p className="text-[12px] text-[#6B7280] mb-3">Key accounts covering the Iran conflict. Click to view latest posts on X.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {twitterAccounts.map((acc) => (
                  <a key={acc.handle} href={`https://twitter.com/${acc.handle}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 border rounded-[4px] hover:bg-gray-50 no-underline transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-[#6B7280] shrink-0">
                      {acc.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[#111827] truncate">{acc.name}</div>
                      <div className="text-[10px] text-[#9CA3AF]">@{acc.handle}</div>
                    </div>
                    <BiasTag bias={acc.bias} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reddit' && (
            <div className="space-y-2">
              {reddit.isLoading && <FeedSkeleton count={8} />}
              {reddit.isError && <ErrorState message="Failed to fetch Reddit posts" onRetry={reddit.refetch} />}
              {reddit.data?.map((post) => {
                const sent = analyzeSentiment(post.title);
                const subClass = subredditColors[post.subreddit] || 'bg-gray-100 text-gray-600';
                return (
                  <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="card block p-3 no-underline hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${subClass}`} style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>r/{post.subreddit}</span>
                      <span className="font-mono text-[11px] text-[#9CA3AF]">{timeAgo(post.createdUtc)}</span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: '1.35', margin: '0 0 6px 0' }}>{post.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span>{post.score} pts</span>
                      <span>{post.numComments} comments</span>
                      <span className="font-mono" style={{ color: getSentimentColor(sent.comparative) }}>
                        {sent.comparative.toFixed(2)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-2">
              <p className="text-[12px] text-[#6B7280] mb-2">Key Telegram channels. Links open in Telegram Web.</p>
              {telegramChannels.map((ch) => (
                <div key={ch.name} className="card p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span className="text-[13px] font-semibold text-[#111827]">{ch.name}</span>
                    <BiasTag bias={ch.bias} />
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{ch.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sentiment Dashboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Gauge */}
          <div className="card p-4 text-center">
            <SectionHeader>Overall Sentiment</SectionHeader>
            <svg viewBox="0 0 200 110" className="w-48 mx-auto">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(gaugeAngle / 180) * 251.2} 251.2`} />
              <defs>
                <linearGradient id="gaugeGrad"><stop offset="0%" stopColor="#DC2626" /><stop offset="50%" stopColor="#D97706" /><stop offset="100%" stopColor="#16A34A" /></linearGradient>
              </defs>
              <text x="100" y="95" textAnchor="middle" className="font-mono" style={{ fontSize: '28px', fontWeight: 700, fill: getSentimentColor(sentimentStats.avg) }}>{gaugeValue}</text>
              <text x="100" y="108" textAnchor="middle" style={{ fontSize: '8px', fill: '#9CA3AF' }}>-100 to +100</text>
            </svg>
            <div className="flex justify-center gap-4 mt-2 text-[10px]">
              <span className="text-[#DC2626]">{sentimentStats.negative} neg</span>
              <span className="text-[#D97706]">{sentimentStats.neutral} neutral</span>
              <span className="text-[#16A34A]">{sentimentStats.positive} pos</span>
            </div>
          </div>

          {/* Trend */}
          <div className="card p-4">
            <SectionHeader>Sentiment Trend</SectionHeader>
            {sentimentOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={sentimentOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#9CA3AF' }} domain={[-5, 5]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                  <Line type="monotone" dataKey="sentiment" stroke="#DC2626" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[140px] flex items-center justify-center text-[12px] text-[#9CA3AF]">Awaiting article data for sentiment trend...</div>}
          </div>

          {/* Top Positive */}
          <div className="card p-4">
            <SectionHeader>Most Positive Headlines</SectionHeader>
            <div className="space-y-2">
              {topPositive.filter(a => a.sentiment > 0).length > 0 ? topPositive.filter(a => a.sentiment > 0).map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block border-l-[3px] border-l-[#16A34A] pl-3 no-underline hover:bg-gray-50 py-1 transition-colors">
                  <div className="text-[12px] text-[#111827] leading-snug">{a.title}</div>
                  <span className="font-mono text-[10px] text-[#16A34A]">+{a.sentiment.toFixed(2)}</span>
                </a>
              )) : <p className="text-[11px] text-[#9CA3AF]">No positive headlines found</p>}
            </div>
          </div>

          {/* Top Negative */}
          <div className="card p-4">
            <SectionHeader>Most Negative Headlines</SectionHeader>
            <div className="space-y-2">
              {topNegative.filter(a => a.sentiment < 0).length > 0 ? topNegative.filter(a => a.sentiment < 0).map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block border-l-[3px] border-l-[#DC2626] pl-3 no-underline hover:bg-gray-50 py-1 transition-colors">
                  <div className="text-[12px] text-[#111827] leading-snug">{a.title}</div>
                  <span className="font-mono text-[10px] text-[#DC2626]">{a.sentiment.toFixed(2)}</span>
                </a>
              )) : <p className="text-[11px] text-[#9CA3AF]">No negative headlines found</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
