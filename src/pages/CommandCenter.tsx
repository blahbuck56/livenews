import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
  useConflictFeed,
  useConflictTimeline,
  useConflictTone,
  computeMetrics,
  computeEscalationIndex,
  extractTrendingKeywords,
  timeAgo,
  type ConflictArticle,
} from '../hooks/useConflictData';
import {
  CONFLICTS,
  CONFLICT_LIST,
  DEFAULT_CONFLICT,
  type ConflictId,
  type ConflictConfig,
  type StatusColor,
} from '../data/conflicts';
import { MetricSkeleton } from '../components/common/LoadingSkeleton';

const CARTO_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// ─── SEVERITY / STATUS HELPERS ──────────────────────────────────────────────────

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  HIGH: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  ELEVATED: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  WATCH: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
};

const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' },
  TENSE: { bg: '#FFFBEB', text: '#D97706', dot: '#D97706' },
  MONITORING: { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  alert: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' },
  warn: { bg: '#FFFBEB', text: '#D97706', dot: '#D97706' },
  stable: { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A' },
};

const sitStatusColor: Record<StatusColor, string> = {
  red: '#DC2626', amber: '#D97706', green: '#16A34A', gray: '#9CA3AF',
};

// ─── LAST-UPDATED TIMER ─────────────────────────────────────────────────────────

function useSecondsAgo(timestamp: number) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    setSecs(Math.floor((Date.now() - timestamp) / 1000));
    const iv = setInterval(() => setSecs(Math.floor((Date.now() - timestamp) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [timestamp]);
  return secs;
}

function LastUpdated({ dataUpdatedAt, isFetching }: { dataUpdatedAt: number; isFetching: boolean }) {
  const secs = useSecondsAgo(dataUpdatedAt || Date.now());
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-[#9CA3AF]">
      {isFetching && <span className="w-2 h-2 border border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />}
      {secs}s ago
    </span>
  );
}

// ─── BADGES ─────────────────────────────────────────────────────────────────────

function SeverityBadge({ level }: { level: string }) {
  const c = severityColors[level] || severityColors.WATCH;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 font-mono uppercase tracking-wider"
      style={{ fontSize: '10px', fontWeight: 700, color: c.text, backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px' }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: c.text }} />
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = statusColorMap[status] || statusColorMap.MONITORING;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono uppercase"
      style={{ fontSize: '9px', fontWeight: 600, color: c.text, backgroundColor: c.bg, borderRadius: '3px' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  );
}

// ─── SPARKLINE ──────────────────────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="h-8 w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── SECTION WRAPPER with last-updated ──────────────────────────────────────────

function Section({ title, dataUpdatedAt, isFetching, children, className = '', link }: {
  title: string; dataUpdatedAt?: number; isFetching?: boolean; children: React.ReactNode; className?: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-header mb-0">{title}</h3>
        <div className="flex items-center gap-2">
          {dataUpdatedAt !== undefined && <LastUpdated dataUpdatedAt={dataUpdatedAt} isFetching={isFetching || false} />}
          {link && <Link to={link.to} className="text-[11px] text-[#2563EB] no-underline hover:underline font-medium">{link.label}</Link>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── SNAPSHOT HERO ──────────────────────────────────────────────────────────────

function SnapshotHero({ config, escalationIndex, dataUpdatedAt, isFetching }: {
  config: ConflictConfig; escalationIndex: number; dataUpdatedAt: number; isFetching: boolean;
}) {
  const sc = severityColors[config.severity] || severityColors.WATCH;
  const eiColor = escalationIndex >= 7 ? '#DC2626' : escalationIndex >= 4 ? '#D97706' : '#2563EB';
  return (
    <div className="card p-4 sm:p-5 mb-4 border-l-4" style={{ borderLeftColor: sc.text }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
        <SeverityBadge level={config.severity} />
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono uppercase" style={{ fontSize: '9px', fontWeight: 600, color: sitStatusColor[config.statusColor], backgroundColor: `${sitStatusColor[config.statusColor]}15`, borderRadius: '3px' }}>
          {config.status}
        </span>
        <LastUpdated dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} />
      </div>
      <h2 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] leading-snug mb-1" style={{ letterSpacing: '-0.3px' }}>
        {config.subtitle}
      </h2>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B7280] font-mono mb-3">
        <span>Since {config.startDate}</span>
        <span style={{ color: eiColor, fontWeight: 600 }}>Escalation: {escalationIndex}/10</span>
        {config.casualtyEstimate && <span>Casualties: {config.casualtyEstimate}</span>}
        {config.displacedEstimate && <span>Displaced: {config.displacedEstimate}</span>}
      </div>
    </div>
  );
}

// ─── ESCALATION TIMELINE ────────────────────────────────────────────────────────

function EscalationTimeline({ nodes }: { nodes: ConflictConfig['timelineEvents'] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const prevNodes = useRef(nodes);
  useEffect(() => { if (prevNodes.current !== nodes) { setSelected(null); prevNodes.current = nodes; } }, [nodes]);

  return (
    <div className="card p-4 mb-4">
      <h3 className="section-header mb-3">Escalation Timeline</h3>
      <div className="relative">
        <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-[#E5E7EB]" />
        <div className="flex overflow-x-auto gap-0 pb-2" style={{ scrollbarWidth: 'thin' }}>
          {nodes.map((node, i) => (
            <button key={i} onClick={() => setSelected(selected === i ? null : i)}
              className="flex flex-col items-center min-w-[110px] sm:min-w-[130px] px-1 relative bg-transparent border-0 cursor-pointer group"
              style={{ outline: 'none' }}>
              <div className={`w-3 h-3 rounded-full border-2 z-10 transition-all ${
                node.isCritical ? 'bg-[#DC2626] border-[#DC2626]'
                  : selected === i ? 'bg-[#111827] border-[#111827]'
                  : 'bg-white border-[#9CA3AF] group-hover:border-[#6B7280]'
              }`} style={selected === i ? { transform: 'scale(1.4)' } : undefined} />
              <div className="mt-2 text-center">
                <div className="font-mono text-[10px] font-medium text-[#9CA3AF]">{node.date}</div>
                <div className="text-[11px] font-semibold text-[#111827] mt-0.5 leading-tight">{node.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div className="mt-2 px-3 py-2 bg-[#F9FAFB] rounded-[4px] border border-[#E5E7EB]">
          <div className="font-mono text-[10px] text-[#9CA3AF] mb-1">{nodes[selected].date}</div>
          <div className="text-[13px] font-semibold text-[#111827]">{nodes[selected].label}</div>
          <div className="text-[12px] text-[#6B7280] mt-0.5">{nodes[selected].detail}</div>
        </div>
      )}
    </div>
  );
}

// ─── METRIC CARDS (computed from live data) ─────────────────────────────────────

function MetricCards({ articles, config, timelineData, toneData, tlUpdated, tlFetching }: {
  articles: ConflictArticle[];
  config: ConflictConfig;
  timelineData: { date: string; count: number }[];
  toneData: { date: string; tone: number }[];
  tlUpdated: number;
  tlFetching: boolean;
}) {
  const metrics = useMemo(() => computeMetrics(articles, config.theaters.length), [articles, config.theaters.length]);
  const tlSpark = useMemo(() => timelineData.slice(-24).map(d => ({ v: d.count })), [timelineData]);
  const tnSpark = useMemo(() => toneData.slice(-24).map(d => ({ v: d.tone })), [toneData]);

  const eiColor = metrics.escalationIndex >= 7 ? 'danger' : metrics.escalationIndex >= 4 ? 'warning' : 'info';
  const eiLabel = metrics.escalationIndex >= 7 ? 'Critical' : metrics.escalationIndex >= 4 ? 'Elevated' : 'Moderate';

  const cards = [
    { label: 'Escalation Index', value: `${metrics.escalationIndex}/10`, delta: eiLabel, deltaType: eiColor as 'danger' | 'warning' | 'info', sparkData: tlSpark },
    { label: 'Avg Sentiment', value: metrics.avgSentiment.toFixed(2), delta: metrics.avgSentiment < -0.5 ? 'Strongly negative' : metrics.avgSentiment < 0 ? 'Negative' : 'Neutral', deltaType: (metrics.avgSentiment < -0.5 ? 'danger' : 'warning') as 'danger' | 'warning', sparkData: tnSpark },
    { label: 'Active Theaters', value: String(metrics.theaterCount), delta: `${config.theaters.filter(t => t.status === 'ACTIVE').length} active`, deltaType: 'warning' as const, sparkData: [] as { v: number }[] },
    { label: 'Sources Reporting', value: String(metrics.sourceCount), delta: `Across ${metrics.sourceCount} outlets`, deltaType: 'info' as const, sparkData: [] as { v: number }[] },
    { label: 'Countries Mentioned', value: String(metrics.countriesMentioned), delta: 'In headlines', deltaType: 'info' as const, sparkData: [] as { v: number }[] },
    { label: 'Conflict Status', value: config.status, delta: config.severity, deltaType: (config.statusColor === 'red' ? 'danger' : 'warning') as 'danger' | 'warning', sparkData: [] as { v: number }[] },
  ];

  const colorMap = { danger: '#DC2626', warning: '#D97706', info: '#2563EB' };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-header mb-0">Live Metrics</h3>
        <LastUpdated dataUpdatedAt={tlUpdated} isFetching={tlFetching} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {cards.map(m => (
          <div key={m.label} className="card p-3">
            <div className="section-header mb-1" style={{ fontSize: '9px' }}>{m.label}</div>
            <div className="text-[18px] sm:text-[22px] font-bold font-mono leading-none text-[#111827]">{m.value}</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: colorMap[m.deltaType] }}>{m.delta}</div>
            {m.sparkData.length > 3 && <MiniSparkline data={m.sparkData} color={colorMap[m.deltaType]} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── THEATER TABLE ──────────────────────────────────────────────────────────────

function TheaterTable({ theaters }: { theaters: ConflictConfig['theaters'] }) {
  return (
    <div className="card mb-4 overflow-x-auto">
      <div className="p-4 pb-2"><h3 className="section-header mb-0">Operational Theaters</h3></div>
      <table className="w-full text-left text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Theater</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Status</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF] hidden sm:table-cell">Last Event</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF] hidden md:table-cell">Assessment</th>
          </tr>
        </thead>
        <tbody>
          {theaters.map(t => (
            <tr key={t.name} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
              <td className="px-4 py-2.5 font-semibold text-[#111827]">{t.name}</td>
              <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-2.5 text-[#6B7280] hidden sm:table-cell">{t.lastEvent}</td>
              <td className="px-4 py-2.5 text-[#9CA3AF] text-[11px] hidden md:table-cell">{t.assessment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── LIVE ARTICLE FEED (tabbed by category) ─────────────────────────────────────

const categoryTabs = [
  { key: 'all', label: 'All' },
  { key: 'military', label: 'Military' },
  { key: 'diplomacy', label: 'Diplomacy' },
  { key: 'humanitarian', label: 'Humanitarian' },
  { key: 'economic', label: 'Economic' },
] as const;

function LiveArticleFeed({ articles, dataUpdatedAt, isFetching }: {
  articles: ConflictArticle[]; dataUpdatedAt: number; isFetching: boolean;
}) {
  const [tab, setTab] = useState<string>('all');
  const filtered = tab === 'all' ? articles : articles.filter(a => a.category === tab);
  const severityColor = (s: number) => s < -0.5 ? '#DC2626' : s < 0 ? '#D97706' : '#16A34A';

  return (
    <Section title="Key Developments" dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} link={{ to: '/feed', label: 'Full feed →' }}>
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {categoryTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border-0 cursor-pointer rounded-[3px] transition-colors whitespace-nowrap ${
              tab === t.key ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}>{t.label}</button>
        ))}
      </div>
      <div className="divide-y divide-[#F3F4F6] max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {filtered.slice(0, 30).map(a => (
          <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
            <div className="flex items-start gap-2.5 py-2.5 px-2 hover:bg-[#F9FAFB] transition-colors rounded-[4px]">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: severityColor(a.sentiment) }} />
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[13px] font-medium text-[#111827] leading-snug">{a.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{a.source}</span>
                  <span className="font-mono text-[10px] text-[#D1D5DB]">{timeAgo(a.publishedAt)}</span>
                  <span className="font-mono text-[9px] px-1 rounded-[2px]" style={{ color: severityColor(a.sentiment), backgroundColor: `${severityColor(a.sentiment)}10` }}>
                    {a.category}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
        {filtered.length === 0 && <div className="py-4 text-center text-[12px] text-[#9CA3AF]">No articles in this category</div>}
      </div>
    </Section>
  );
}

// ─── CONFLICT MAP ───────────────────────────────────────────────────────────────

function ConflictMap({ config }: { config: ConflictConfig }) {
  const mapRef = useRef<L.Map | null>(null);
  const prevCenter = useRef(config.mapCenter);

  useEffect(() => {
    if (mapRef.current && (prevCenter.current[0] !== config.mapCenter[0] || prevCenter.current[1] !== config.mapCenter[1])) {
      mapRef.current.flyTo(config.mapCenter, config.mapZoom, { duration: 1.5 });
      prevCenter.current = config.mapCenter;
    }
  }, [config.mapCenter, config.mapZoom]);

  return (
    <div className="card p-4 mb-4">
      <h3 className="section-header mb-2">Operational Map — {config.name}</h3>
      <div className="h-[280px] sm:h-[350px]">
        <MapContainer
          center={config.mapCenter}
          zoom={config.mapZoom}
          scrollWheelZoom={false}
          dragging={true}
          style={{ height: '100%', width: '100%', borderRadius: '6px' }}
          ref={(map) => { if (map) mapRef.current = map; }}
        >
          <TileLayer attribution='&copy; CARTO' url={CARTO_TILES} />
          {config.keyLocations.map(loc => (
            <CircleMarker key={loc.name} center={[loc.lat, loc.lng]} radius={8}
              fillColor="#DC2626" fillOpacity={0.6} color="#DC2626" weight={2}>
              <Popup>
                <strong>{loc.name}</strong><br />
                <span style={{ fontSize: 11 }}>{loc.description}</span>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {config.keyLocations.map(l => (
          <span key={l.name} className="flex items-center gap-1 text-[10px] text-[#9CA3AF] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />{l.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── TRENDING KEYWORDS CHART ────────────────────────────────────────────────────

function TrendingKeywordsChart({ articles, dataUpdatedAt, isFetching }: {
  articles: ConflictArticle[]; dataUpdatedAt: number; isFetching: boolean;
}) {
  const keywords = useMemo(() => extractTrendingKeywords(articles, 15), [articles]);

  if (keywords.length === 0) return null;

  return (
    <Section title="Trending Keywords" dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} className="mb-3">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={keywords} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="word" tick={{ fontSize: 10, fill: '#6B7280' }} width={55} />
            <Tooltip formatter={(v) => [`${v ?? 0} mentions`]} contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="count" fill="#2563EB" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

// ─── VOLUME CHART ───────────────────────────────────────────────────────────────

function VolumeChart({ data, dataUpdatedAt, isFetching }: {
  data: { date: string; count: number }[]; dataUpdatedAt: number; isFetching: boolean;
}) {
  if (data.length === 0) return null;

  return (
    <Section title="Article Volume (72h)" dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} className="mb-3">
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip formatter={(v) => [`${v ?? 0} articles`]} labelFormatter={() => ''} contentStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="count" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

// ─── RIGHT RAIL ─────────────────────────────────────────────────────────────────

function RightRail({ config, articles, dataUpdatedAt, isFetching }: {
  config: ConflictConfig; articles: ConflictArticle[]; dataUpdatedAt: number; isFetching: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Situation Status */}
      <Section title="Situation Status" dataUpdatedAt={dataUpdatedAt} isFetching={isFetching}>
        <div className="space-y-1.5">
          {Object.entries(config.situationStatus).map(([key, { value, color }]) => (
            <div key={key} className="flex items-start justify-between gap-2 py-1">
              <span className="text-[10px] font-medium text-[#6B7280] shrink-0">{key}</span>
              <span className="text-[10px] font-mono font-semibold text-right" style={{ color: sitStatusColor[color] }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Watchlist */}
      <Section title="Watchlist">
        <div className="space-y-2">
          {config.watchlist.map(item => {
            const c = statusColorMap[item.status] || statusColorMap.stable;
            return (
              <div key={item.label} className="flex items-start gap-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: c.dot }} />
                <div>
                  <div className="text-[11px] font-semibold text-[#111827]">{item.label}</div>
                  <div className="text-[10px] text-[#6B7280]">{item.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Trending Keywords */}
      <TrendingKeywordsChart articles={articles} dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} />
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const [conflictId, setConflictId] = useState<ConflictId>(DEFAULT_CONFLICT);
  const config = CONFLICTS[conflictId];

  // All hooks keyed by conflictId — automatically refetch on change
  const feed = useConflictFeed(conflictId);
  const timeline = useConflictTimeline(conflictId);
  const tone = useConflictTone(conflictId);

  const articles = feed.data || [];
  const timelineData = timeline.data || [];
  const toneData = tone.data || [];

  const handleConflictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setConflictId(e.target.value as ConflictId);
  }, []);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] m-0" style={{ letterSpacing: '-0.5px' }}>
            Conflict Command Center
          </h1>
          <SeverityBadge level={config.severity} />
        </div>
        <div className="flex items-center gap-2">
          <span className="section-header" style={{ fontSize: '9px' }}>Active Conflict:</span>
          <select
            value={conflictId}
            onChange={handleConflictChange}
            className="font-mono text-[11px] font-semibold text-[#111827] bg-white border border-[#E5E7EB] rounded-[4px] px-2 py-1 cursor-pointer hover:border-[#D1D5DB]"
            style={{ minHeight: 'auto' }}
          >
            {CONFLICT_LIST.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Snapshot */}
      <SnapshotHero
        config={config}
        escalationIndex={computeEscalationIndex(articles)}
        dataUpdatedAt={feed.dataUpdatedAt}
        isFetching={feed.isFetching}
      />

      {/* Escalation Timeline */}
      <EscalationTimeline nodes={config.timelineEvents} />

      {/* Live Metrics */}
      {feed.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)}
        </div>
      ) : (
        <MetricCards
          articles={articles}
          config={config}
          timelineData={timelineData}
          toneData={toneData}
          tlUpdated={timeline.dataUpdatedAt}
          tlFetching={timeline.isFetching}
        />
      )}

      {/* Map + Theater Table */}
      <ConflictMap config={config} />
      <TheaterTable theaters={config.theaters} />

      {/* Main Content: Feed + Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <LiveArticleFeed articles={articles} dataUpdatedAt={feed.dataUpdatedAt} isFetching={feed.isFetching} />
          <VolumeChart data={timelineData} dataUpdatedAt={timeline.dataUpdatedAt} isFetching={timeline.isFetching} />
        </div>
        <div>
          <RightRail config={config} articles={articles} dataUpdatedAt={feed.dataUpdatedAt} isFetching={feed.isFetching} />
        </div>
      </div>
    </div>
  );
}
