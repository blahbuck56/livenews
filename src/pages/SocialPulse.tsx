import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRedditFeed } from '../hooks/useReddit';
import { useCombinedNews } from '../hooks/useNews';
import { timeAgo } from '../utils/time';
import { analyzeSentiment, getSentimentColor } from '../utils/sentiment';
import { FeedSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

const twitterAccounts = [
  { handle: 'Reuters', name: 'Reuters', bias: 'Neutral' },
  { handle: 'AP', name: 'Associated Press', bias: 'Neutral' },
  { handle: 'AJEnglish', name: 'Al Jazeera English', bias: 'Regional' },
  { handle: 'BBCBreaking', name: 'BBC Breaking', bias: 'Western' },
  { handle: 'IranIntl_En', name: 'Iran International', bias: 'Opposition' },
  { handle: 'sentdefender', name: 'OSINT Defender', bias: 'OSINT' },
  { handle: 'OSINTWarfare', name: 'OSINT Warfare', bias: 'OSINT' },
  { handle: 'Osint613', name: 'Osint613', bias: 'OSINT' },
  { handle: 'netblocks', name: 'NetBlocks', bias: 'OSINT' },
  { handle: 'TheStudyofWar', name: 'ISW', bias: 'Western' },
  { handle: 'Joyce_Karam', name: 'Joyce Karam', bias: 'Independent' },
  { handle: 'BarakRavid', name: 'Barak Ravid', bias: 'Israeli' },
  { handle: 'NatashaBertrand', name: 'Natasha Bertrand', bias: 'Western' },
  { handle: 'JackDetsch', name: 'Jack Detsch', bias: 'Western' },
  { handle: 'Ali_Vaez', name: 'Ali Vaez', bias: 'Independent' },
  { handle: 'AzadehMoaveni', name: 'Azadeh Moaveni', bias: 'Independent' },
  { handle: 'IranWire', name: 'IranWire', bias: 'Opposition' },
];

const telegramChannels = [
  { name: 'Tasnim News Agency', description: 'IRGC-linked, primary for official Iranian military statements', url: 'https://t.me/tasaborednotpresent' },
  { name: 'Fars News Agency', description: 'Semi-official Iranian news, hardline perspective', url: 'https://t.me/faborednotpresent' },
  { name: 'Iran International', description: 'London-based, critical of Iranian regime', url: 'https://t.me/iraborednotpresent' },
  { name: 'NetBlocks', description: 'Internet connectivity and censorship monitoring', url: 'https://t.me/neborednotpresent' },
  { name: 'OSINT Aggregator', description: 'Open source intelligence collection channel', url: 'https://t.me/osaborednotpresent' },
];

type Tab = 'twitter' | 'reddit' | 'telegram';

export default function SocialPulse() {
  const [activeTab, setActiveTab] = useState<Tab>('reddit');
  const reddit = useRedditFeed();
  const { articles } = useCombinedNews();

  const sentimentStats = useMemo(() => {
    const scores = articles.map((a) => a.sentiment || analyzeSentiment(a.title));
    if (scores.length === 0) return { avg: 0, positive: 0, negative: 0, neutral: 0 };

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const positive = scores.filter((s) => s > 0.2).length;
    const negative = scores.filter((s) => s < -0.2).length;
    const neutral = scores.length - positive - negative;

    return { avg, positive, negative, neutral };
  }, [articles]);

  const topPositive = useMemo(() => {
    return articles
      .filter((a) => (a.sentiment || 0) > 0)
      .sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0))
      .slice(0, 3);
  }, [articles]);

  const topNegative = useMemo(() => {
    return articles
      .filter((a) => (a.sentiment || 0) < 0)
      .sort((a, b) => (a.sentiment || 0) - (b.sentiment || 0))
      .slice(0, 3);
  }, [articles]);

  const sentimentOverTime = useMemo(() => {
    const buckets: Record<string, { sum: number; count: number }> = {};
    for (const a of articles) {
      const hour = a.publishedAt.slice(0, 13);
      if (!buckets[hour]) buckets[hour] = { sum: 0, count: 0 };
      buckets[hour].sum += a.sentiment || 0;
      buckets[hour].count++;
    }
    return Object.entries(buckets)
      .map(([hour, data]) => ({ hour: hour.slice(11, 13) + ':00', sentiment: data.sum / data.count }))
      .slice(-24);
  }, [articles]);

  const pieData = [
    { name: 'Negative', value: sentimentStats.negative, color: '#DC2626' },
    { name: 'Neutral', value: sentimentStats.neutral, color: '#D97706' },
    { name: 'Positive', value: sentimentStats.positive, color: '#16A34A' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-[#111827] mb-4">Social Pulse</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Column: Social Feed (60%) */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex border-b border-[#E5E7EB] mb-4">
            {(['twitter', 'reddit', 'telegram'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium border-b-2 bg-transparent cursor-pointer ${
                  activeTab === tab
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab === 'twitter' ? 'Twitter/X' : tab === 'reddit' ? 'Reddit' : 'Telegram'}
              </button>
            ))}
          </div>

          {/* Twitter Tab */}
          {activeTab === 'twitter' && (
            <div className="space-y-3">
              <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
                <p className="text-xs text-[#6B7280] mb-3">Key accounts covering the Iran conflict. Click to view their latest posts on X.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {twitterAccounts.map((account) => (
                    <a
                      key={account.handle}
                      href={`https://twitter.com/${account.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border border-[#E5E7EB] rounded hover:bg-[#F9FAFB] no-underline"
                      style={{ borderRadius: '4px' }}
                    >
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                        {account.handle[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#111827] truncate">{account.name}</div>
                        <div className="text-[10px] text-[#9CA3AF]">@{account.handle}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded`}
                        style={{
                          borderRadius: '3px',
                          backgroundColor: account.bias === 'OSINT' ? '#7C3AED18' : account.bias === 'Neutral' ? '#16A34A18' : '#2563EB18',
                          color: account.bias === 'OSINT' ? '#7C3AED' : account.bias === 'Neutral' ? '#16A34A' : '#2563EB',
                        }}
                      >
                        {account.bias}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reddit Tab */}
          {activeTab === 'reddit' && (
            <div className="space-y-2">
              {reddit.isLoading && <FeedSkeleton count={8} />}
              {reddit.isError && <ErrorState message="Failed to fetch Reddit posts" onRetry={reddit.refetch} />}
              {reddit.data?.map((post) => {
                const sentiment = analyzeSentiment(post.title);
                return (
                  <div key={post.id} className="bg-white border border-[#E5E7EB] rounded-[6px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-[#7C3AED]">r/{post.subreddit}</span>
                      <span className="text-[10px] font-mono text-[#9CA3AF]">{timeAgo(new Date(post.createdUtc * 1000).toISOString())}</span>
                    </div>
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="no-underline">
                      <h4 className="text-sm font-medium text-[#111827] hover:text-[#2563EB] leading-snug mb-1.5">
                        {post.title}
                      </h4>
                    </a>
                    <div className="flex items-center gap-3 text-[10px] text-[#6B7280]">
                      <span>{post.score} pts</span>
                      <span>{post.numComments} comments</span>
                      <span className="font-mono" style={{ color: getSentimentColor(sentiment) }}>
                        sentiment: {sentiment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6B7280] mb-2">Key Telegram channels for Iran conflict updates. Links open in Telegram Web.</p>
              {telegramChannels.map((ch) => (
                <a
                  key={ch.name}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-[#E5E7EB] rounded-[6px] p-4 hover:bg-[#F9FAFB] no-underline"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span className="text-sm font-medium text-[#111827]">{ch.name}</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{ch.description}</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sentiment Dashboard (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Overall Sentiment */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Overall Sentiment</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={180} height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold font-mono" style={{ color: getSentimentColor(sentimentStats.avg) }}>
                {(sentimentStats.avg * 100).toFixed(0)}
              </div>
              <div className="text-[10px] text-[#9CA3AF]">Scale: -100 to +100</div>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-[10px]">
              <span className="text-[#DC2626]">{sentimentStats.negative} negative</span>
              <span className="text-[#D97706]">{sentimentStats.neutral} neutral</span>
              <span className="text-[#16A34A]">{sentimentStats.positive} positive</span>
            </div>
          </div>

          {/* Sentiment Trend */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Sentiment Trend</h3>
            {sentimentOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sentimentOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} domain={[-1, 1]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                  <Line type="monotone" dataKey="sentiment" stroke="#DC2626" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-xs text-[#9CA3AF]">Calculating trend...</div>
            )}
          </div>

          {/* Top Positive */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider mb-3">Top Positive Headlines</h3>
            <div className="space-y-2">
              {topPositive.length > 0 ? topPositive.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#374151] hover:text-[#2563EB] no-underline leading-snug">
                  {a.title}
                  <span className="ml-1 font-mono text-[#16A34A]">[+{(a.sentiment || 0).toFixed(2)}]</span>
                </a>
              )) : (
                <p className="text-xs text-[#9CA3AF]">No positive headlines found</p>
              )}
            </div>
          </div>

          {/* Top Negative */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#DC2626] uppercase tracking-wider mb-3">Top Negative Headlines</h3>
            <div className="space-y-2">
              {topNegative.length > 0 ? topNegative.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#374151] hover:text-[#2563EB] no-underline leading-snug">
                  {a.title}
                  <span className="ml-1 font-mono text-[#DC2626]">[{(a.sentiment || 0).toFixed(2)}]</span>
                </a>
              )) : (
                <p className="text-xs text-[#9CA3AF]">No negative headlines found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
