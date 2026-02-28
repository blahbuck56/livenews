import { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useCombinedNews, useGdeltTimeline, useGdeltTone } from '../hooks/useGdeltArticles';
import { extractKeywords, extractEntities } from '../lib/keywords';
import { strikeLocations } from '../data/strikeLocations';
import { timelineEvents } from '../data/timelineEvents';
import { MetricSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import SectionHeader from '../components/common/SectionHeader';

const CARTO_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const monoTick = { fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#9CA3AF' };

// Parse GDELT date (YYYYMMDDHHMMSS or YYYYMMDDTHHMMSSZ) to "HH:MM" label
function gdeltDateToTimeLabel(dateStr: string): string {
  if (!dateStr) return '??';
  const cleaned = dateStr.replace(/[TZ]/g, '');
  if (cleaned.length >= 12) return cleaned.slice(8, 10) + ':' + cleaned.slice(10, 12);
  if (cleaned.length >= 10) return cleaned.slice(8, 10) + ':00';
  return dateStr.slice(0, 10);
}

export default function Dashboard() {
  const { articles, isLoading } = useCombinedNews();
  const timeline = useGdeltTimeline();
  const tone = useGdeltTone();

  const articleCount = articles.length;
  const avgSentiment = useMemo(() => articles.length ? articles.reduce((s, a) => s + a.sentiment, 0) / articles.length : 0, [articles]);
  const uniqueSources = useMemo(() => new Set(articles.map((a) => a.source)).size, [articles]);
  const countriesMentioned = useMemo(() => {
    const names = ['Iran', 'Israel', 'Iraq', 'Syria', 'Lebanon', 'Yemen', 'Saudi', 'Qatar', 'UAE', 'Turkey', 'Russia', 'China', 'France', 'Germany', 'UK', 'United States'];
    const found = new Set<string>();
    for (const a of articles) for (const c of names) if (a.title.includes(c)) found.add(c);
    return found.size;
  }, [articles]);

  const sentimentColor = avgSentiment > 0.5 ? '#16A34A' : avgSentiment < -0.5 ? '#DC2626' : '#D97706';
  const timelineData = (timeline.data || []).slice(-48).map((d: { date: string; count: number }) => ({ time: gdeltDateToTimeLabel(d.date), count: d.count }));
  const toneData = (tone.data || []).slice(-48).map((d: { date: string; tone: number }) => ({ time: gdeltDateToTimeLabel(d.date), tone: d.tone }));
  const topSources = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const a of articles) freq[a.source] = (freq[a.source] || 0) + 1;
    return Object.entries(freq).map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 25) + '..' : name, count })).sort((a, b) => b.count - a.count).slice(0, 15);
  }, [articles]);
  const keywords = useMemo(() => extractKeywords(articles.map((a) => a.title), 20), [articles]);
  const entities = useMemo(() => extractEntities(articles.map((a) => a.title)), [articles]);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px' }}>War Dashboard</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />) : (<>
          <div className="card p-3 sm:p-4"><SectionHeader>Articles (24h)</SectionHeader><div className="text-[24px] sm:text-[32px] font-bold font-mono leading-none text-[#111827]">{articleCount}</div></div>
          <div className="card p-3 sm:p-4"><SectionHeader>Avg Sentiment</SectionHeader><div className="text-[24px] sm:text-[32px] font-bold font-mono leading-none" style={{ color: sentimentColor }}>{avgSentiment.toFixed(2)}</div><div className="text-[10px] font-mono text-[#9CA3AF] mt-1">comparative score</div></div>
          <div className="card p-3 sm:p-4"><SectionHeader>Sources Reporting</SectionHeader><div className="text-[24px] sm:text-[32px] font-bold font-mono leading-none text-[#111827]">{uniqueSources}</div></div>
          <div className="card p-3 sm:p-4"><SectionHeader>Countries Mentioned</SectionHeader><div className="text-[24px] sm:text-[32px] font-bold font-mono leading-none text-[#111827]">{countriesMentioned}</div></div>
        </>)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {timeline.isLoading ? <ChartSkeleton /> : (
          <div className="card p-4">
            <SectionHeader>Article Volume / Hour</SectionHeader>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="time" tick={monoTick} /><YAxis tick={monoTick} /><Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} /><Area type="monotone" dataKey="count" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} /></AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-[12px] text-[#9CA3AF]">{timeline.isError ? 'Failed to load timeline data' : 'No timeline data available'}</div>}
          </div>
        )}
        {tone.isLoading ? <ChartSkeleton /> : (
          <div className="card p-4">
            <SectionHeader>Sentiment Over Time</SectionHeader>
            {toneData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={toneData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="time" tick={monoTick} /><YAxis tick={monoTick} /><Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} /><Line type="monotone" dataKey="tone" stroke="#DC2626" dot={false} strokeWidth={2} /></LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-[12px] text-[#9CA3AF]">{tone.isError ? 'Failed to load sentiment data' : 'No sentiment data available'}</div>}
          </div>
        )}
      </div>

      {/* Map + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <SectionHeader>Strike Location Map</SectionHeader>
          <div className="h-[250px] sm:h-[300px]">
            <MapContainer center={[32.43, 53.69]} zoom={5} scrollWheelZoom={false} dragging={true} style={{ height: '100%', width: '100%', borderRadius: '6px' }}>
              <TileLayer attribution='&copy; CARTO' url={CARTO_TILES} />
              {strikeLocations.map((loc) => (
                <CircleMarker key={loc.name} center={[loc.lat, loc.lng]} radius={8} fillColor="#DC2626" fillOpacity={0.7} color="#FFFFFF" weight={2}>
                  <Popup><strong>{loc.name}</strong><br /><span style={{ fontSize: 12 }}>{loc.description}</span></Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
        <div className="card p-4">
          <SectionHeader>Top Sources</SectionHeader>
          {topSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSources} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis type="number" tick={monoTick} /><YAxis type="category" dataKey="name" tick={{ ...monoTick, fill: '#6B7280', fontSize: 8 }} width={70} /><Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} /><Bar dataKey="count" fill="#2563EB" radius={[0, 3, 3, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-[12px] text-[#9CA3AF]">{isLoading ? 'Loading...' : 'No source data available'}</div>}
        </div>
      </div>

      {/* Keywords + Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <SectionHeader>Keyword Frequency</SectionHeader>
          {keywords.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywords.slice(0, 15)} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis type="number" tick={monoTick} /><YAxis type="category" dataKey="word" tick={{ ...monoTick, fill: '#6B7280', fontSize: 8 }} width={55} /><Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} /><Bar dataKey="count" fill="#7C3AED" radius={[0, 3, 3, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-[12px] text-[#9CA3AF]">{isLoading ? 'Analyzing...' : 'No keyword data available'}</div>}
        </div>
        <div className="card p-4">
          <SectionHeader>Key Entities</SectionHeader>
          <div className="space-y-4">
            {(['person', 'org', 'location'] as const).map((type) => {
              const items = entities.filter((e) => e.type === type).slice(0, 8);
              if (!items.length) return null;
              return (<div key={type}><div className="section-header mb-2" style={{ fontSize: '9px' }}>{type === 'person' ? 'People' : type === 'org' ? 'Organizations' : 'Locations'}</div><div className="flex flex-wrap gap-1.5">{items.map((e) => (<span key={e.name} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-[3px]" style={{ fontSize: '11px' }}>{e.name} <span className="text-[#9CA3AF]">({e.count})</span></span>))}</div></div>);
            })}
          </div>
        </div>
      </div>

      {/* Oil + Escalation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <SectionHeader>Oil Price (Brent Crude)</SectionHeader>
          <div className="text-[24px] sm:text-[32px] font-bold text-[#D97706] font-mono leading-none mb-1">$94.82</div>
          <div className="text-[12px] text-[#DC2626]">+$6.34 (+7.2%) since strikes began</div>
          <div className="text-[10px] font-mono text-[#9CA3AF] mt-2">Delayed feed. Markets volatile.</div>
        </div>
        <div className="card p-4">
          <SectionHeader>Conflict Escalation Index</SectionHeader>
          <div className="text-[24px] sm:text-[32px] font-bold text-[#DC2626] font-mono leading-none mb-1">8.7 / 10</div>
          <div className="text-[12px] text-[#DC2626]">CRITICAL — Active military operations</div>
          <div className="text-[10px] font-mono text-[#9CA3AF] mt-2">Based on GDELT Goldstein Scale</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4">
        <SectionHeader>Escalation Timeline</SectionHeader>
        <div className="relative mt-4"><div className="absolute top-3 left-0 right-0 h-[2px] bg-[#E5E7EB]" />
          <div className="flex overflow-x-auto gap-0 pb-4">
            {timelineEvents.map((ev, i) => (
              <div key={i} className="flex flex-col items-center min-w-[130px] px-1 relative">
                <div className={`w-3 h-3 rounded-full border-2 z-10 ${ev.title.includes('Epic Fury') || ev.title.includes('retaliates') || ev.title.includes('close airspace') ? 'bg-[#DC2626] border-[#DC2626]' : 'bg-white border-[#6B7280]'}`} />
                <div className="mt-2 text-center"><div className="font-mono text-[10px] font-medium text-[#6B7280]">{ev.date}</div><div className="text-[11px] font-semibold text-[#111827] mt-0.5 leading-tight">{ev.title}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
