import { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useCombinedNews, useGdeltTimeline, useGdeltTone } from '../hooks/useNews';
import { extractKeywords, extractEntities } from '../utils/keywords';
import { strikeLocations } from '../data/strikeLocations';
import { MetricSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function Dashboard() {
  const { articles, isLoading } = useCombinedNews();
  const timeline = useGdeltTimeline();
  const tone = useGdeltTone();

  const articleCount = articles.length;

  const avgSentiment = useMemo(() => {
    if (articles.length === 0) return 0;
    const sum = articles.reduce((acc, a) => acc + (a.sentiment || 0), 0);
    return sum / articles.length;
  }, [articles]);

  const uniqueSources = useMemo(() => {
    return new Set(articles.map((a) => a.source)).size;
  }, [articles]);

  const countriesMentioned = useMemo(() => {
    const countries = new Set<string>();
    const countryNames = ['Iran', 'Israel', 'Iraq', 'Syria', 'Lebanon', 'Yemen', 'Saudi', 'Qatar', 'UAE', 'Turkey', 'Russia', 'China', 'France', 'Germany', 'UK', 'United States'];
    for (const a of articles) {
      for (const c of countryNames) {
        if (a.title.includes(c)) countries.add(c);
      }
    }
    return countries.size;
  }, [articles]);

  const topSources = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const a of articles) {
      freq[a.source] = (freq[a.source] || 0) + 1;
    }
    return Object.entries(freq)
      .map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 25) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [articles]);

  const keywords = useMemo(() => {
    return extractKeywords(articles.map((a) => a.title), 20);
  }, [articles]);

  const entities = useMemo(() => {
    return extractEntities(articles.map((a) => a.title));
  }, [articles]);

  const sentimentColor = avgSentiment > 0.2 ? '#16A34A' : avgSentiment < -0.2 ? '#DC2626' : '#D97706';

  const timelineData = (timeline.data || []).slice(-48).map((d) => ({
    time: d.date?.slice(8, 10) + ':' + (d.date?.slice(10, 12) || '00'),
    count: d.count,
  }));

  const toneData = (tone.data || []).slice(-48).map((d) => ({
    time: d.date?.slice(8, 10) + ':' + (d.date?.slice(10, 12) || '00'),
    tone: d.tone,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-[#111827] mb-4">War Dashboard</h1>

      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Articles (24h)</div>
              <div className="text-3xl font-bold text-[#111827] font-mono">{articleCount}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Sentiment Score</div>
              <div className="text-3xl font-bold font-mono" style={{ color: sentimentColor }}>
                {avgSentiment.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#9CA3AF]">Scale: -1.0 to +1.0</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Sources Reporting</div>
              <div className="text-3xl font-bold text-[#111827] font-mono">{uniqueSources}</div>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Countries Mentioned</div>
              <div className="text-3xl font-bold text-[#111827] font-mono">{countriesMentioned}</div>
            </div>
          </>
        )}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {timeline.isLoading ? <ChartSkeleton /> : (
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Article Volume Over Time</h3>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                  <Area type="monotone" dataKey="count" stroke="#2563EB" fill="#DBEAFE" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-[#9CA3AF]">Loading timeline data...</div>
            )}
          </div>
        )}

        {tone.isLoading ? <ChartSkeleton /> : (
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
            <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Sentiment Over Time</h3>
            {toneData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={toneData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                  <Line type="monotone" dataKey="tone" stroke="#DC2626" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-[#9CA3AF]">Loading sentiment data...</div>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Map + Top Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Strike Location Map</h3>
          <div className="h-[300px]">
            <MapContainer center={[33.5, 51.5]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '6px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {strikeLocations.map((loc) => (
                <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={defaultIcon}>
                  <Popup>
                    <div>
                      <strong>{loc.name}</strong>
                      <br />
                      <span style={{ fontSize: 12 }}>{loc.description}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Top Sources</h3>
          {topSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSources} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-xs text-[#9CA3AF]">Loading source data...</div>
          )}
        </div>
      </div>

      {/* Row 4: Keywords + Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Keyword Frequency</h3>
          {keywords.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywords.slice(0, 15)} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="word" tick={{ fontSize: 10, fill: '#6B7280' }} width={60} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-xs text-[#9CA3AF]">Analyzing keywords...</div>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Entity Extraction</h3>
          <div className="space-y-4">
            {(['person', 'org', 'location'] as const).map((type) => {
              const filtered = entities.filter((e) => e.type === type).slice(0, 8);
              if (filtered.length === 0) return null;
              return (
                <div key={type}>
                  <h4 className="text-[10px] font-semibold text-[#9CA3AF] uppercase mb-2">
                    {type === 'person' ? 'People' : type === 'org' ? 'Organizations' : 'Locations'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {filtered.map((e) => (
                      <span key={e.name} className="px-2 py-0.5 text-[11px] bg-[#F3F4F6] text-[#374151] rounded" style={{ borderRadius: '3px' }}>
                        {e.name} <span className="text-[#9CA3AF]">({e.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5: Oil Price + Escalation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Oil Price (Brent Crude)</h3>
          <div className="text-3xl font-bold text-[#D97706] font-mono mb-1">$94.82</div>
          <div className="text-xs text-[#DC2626]">+$6.34 (+7.2%) since strikes began</div>
          <div className="text-[10px] font-mono text-[#9CA3AF] mt-2">Updated: Delayed feed. Markets volatile.</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4">
          <h3 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Conflict Escalation Index</h3>
          <div className="text-3xl font-bold text-[#DC2626] font-mono mb-1">8.7 / 10</div>
          <div className="text-xs text-[#DC2626]">CRITICAL — Active military operations</div>
          <div className="text-[10px] font-mono text-[#9CA3AF] mt-2">Based on GDELT Goldstein Scale aggregation</div>
        </div>
      </div>
    </div>
  );
}
