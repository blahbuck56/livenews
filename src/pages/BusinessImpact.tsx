import { useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchGdeltTopicArticles } from '../lib/api';
import { analyzeSentiment } from '../lib/sentiment';
import { MetricSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import SectionHeader from '../components/common/SectionHeader';

const CARTO_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const monoTick = { fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#9CA3AF' };

// ============================================================
// Trade corridor & chokepoint data
// ============================================================

const chokepoints = [
  { name: 'Strait of Hormuz', lat: 26.56, lng: 56.25, status: 'BLOCKED', dailyBarrels: '21M bbl/day', pctGlobal: '21%', risk: 10, color: '#DC2626',
    detail: 'Effectively closed. Military operations ongoing. Insurance premiums up 400%.' },
  { name: 'Bab el-Mandeb', lat: 12.6, lng: 43.3, status: 'HIGH RISK', dailyBarrels: '6.2M bbl/day', pctGlobal: '9%', risk: 8, color: '#D97706',
    detail: 'Houthi anti-ship attacks ongoing. Multiple tankers hit. Rerouting via Cape of Good Hope.' },
  { name: 'Suez Canal', lat: 30.46, lng: 32.35, status: 'DISRUPTED', dailyBarrels: '5.5M bbl/day', pctGlobal: '12% trade', risk: 6, color: '#D97706',
    detail: 'Operating but transit volumes down 35%. Elevated security posture. Higher surcharges.' },
  { name: 'Turkish Straits', lat: 41.12, lng: 29.05, status: 'MONITORING', dailyBarrels: '3.2M bbl/day', pctGlobal: '3%', risk: 3, color: '#2563EB',
    detail: 'Turkey restricting military vessel transit. Commercial shipping normal.' },
  { name: 'Strait of Malacca', lat: 1.4, lng: 103.8, status: 'NORMAL', dailyBarrels: '16M bbl/day', pctGlobal: '25%', risk: 2, color: '#16A34A',
    detail: 'No direct impact yet. Asian buyers seeking alternative crude sources.' },
];

const tradeRoutes: [number, number][][] = [
  // Hormuz → Suez → Mediterranean
  [[26.5, 56.3], [23.5, 58.5], [21.0, 60.0], [15.0, 52.0], [12.6, 43.3], [15.0, 42.0], [30.4, 32.3], [35.0, 28.0]],
  // Hormuz → India → Malacca
  [[26.5, 56.3], [23.0, 60.0], [18.0, 65.0], [12.0, 72.0], [8.0, 80.0], [4.0, 95.0], [1.4, 103.8]],
  // Bab el-Mandeb → Cape of Good Hope reroute
  [[12.6, 43.3], [5.0, 45.0], [-5.0, 42.0], [-15.0, 40.0], [-34.0, 18.0]],
];

// ============================================================
// Commodity & market impact data (simulated real-time)
// ============================================================

function generateCommodityTimeline(base: number, volatility: number, trend: number): { day: string; price: number }[] {
  const data: { day: string; price: number }[] = [];
  let price = base - trend * 14;
  for (let i = 14; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    price += trend + (Math.random() - 0.4) * volatility;
    data.push({ day: label, price: Number(price.toFixed(2)) });
  }
  return data;
}

const brentData = generateCommodityTimeline(88, 2.5, 0.6);
const goldData = generateCommodityTimeline(2180, 30, 8);
const natGasData = generateCommodityTimeline(2.8, 0.15, 0.05);
const shippingData = generateCommodityTimeline(1800, 200, 80);

// ============================================================
// Cross-border trade impact sectors
// ============================================================

const tradeImpactSectors = [
  { sector: 'Crude Oil & Gas', impact: -38, volume: '$890B/yr', status: 'SEVERE', color: '#DC2626',
    detail: 'Hormuz blockage halts 21% of global oil transit. Spot prices spiking. LNG rerouting.' },
  { sector: 'Petrochemicals', impact: -29, volume: '$420B/yr', status: 'SEVERE', color: '#DC2626',
    detail: 'Iranian exports halted. Gulf state output disrupted. Plastics/fertilizer feedstock shortage.' },
  { sector: 'Container Shipping', impact: -22, volume: '$1.2T/yr', status: 'HIGH', color: '#D97706',
    detail: 'Suez traffic down 35%. Rerouting via Cape adds 10-14 days. Rates up 180%.' },
  { sector: 'Agriculture & Food', impact: -18, volume: '$310B/yr', status: 'HIGH', color: '#D97706',
    detail: 'Fertilizer shortages from petrochemical disruption. Wheat/grain shipments delayed.' },
  { sector: 'Automotive & Mfg', impact: -14, volume: '$680B/yr', status: 'MODERATE', color: '#D97706',
    detail: 'Energy cost pass-through. Supply chain delays for Gulf-sourced components.' },
  { sector: 'Financial Services', impact: -12, volume: '$2.1T/yr', status: 'MODERATE', color: '#D97706',
    detail: 'Sanctions compliance burden. SWIFT restrictions widening. Correspondent banking disrupted.' },
  { sector: 'Tech & Electronics', impact: -8, volume: '$950B/yr', status: 'LOW-MOD', color: '#2563EB',
    detail: 'Indirect via energy costs. Semiconductor supply unaffected. Data center power costs up.' },
  { sector: 'Pharma & Medical', impact: -5, volume: '$380B/yr', status: 'LOW', color: '#16A34A',
    detail: 'Humanitarian exemptions apply. Some logistics delays for Middle East-routed supplies.' },
];

const sanctionsTracker = [
  { entity: 'Central Bank of Iran', type: 'Financial', date: 'Active', scope: 'Full block — no USD clearing' },
  { entity: 'NIOC (National Iranian Oil Co)', type: 'Energy', date: 'Active', scope: 'Complete export ban' },
  { entity: 'IRGC & subsidiaries', type: 'Military/Commercial', date: 'Active', scope: 'SDN list — global asset freeze' },
  { entity: 'Iranian shipping lines (IRISL)', type: 'Transport', date: 'Active', scope: 'Vessel tracking, port bans' },
  { entity: 'Petrochemical sector', type: 'Industrial', date: 'Expanded', scope: 'Secondary sanctions on buyers' },
  { entity: 'Iranian metals/minerals', type: 'Mining', date: 'Active', scope: 'Steel, aluminum, copper exports blocked' },
  { entity: 'Third-party facilitators', type: 'Enforcement', date: 'New', scope: 'UAE/Turkey intermediaries targeted' },
];

const currencyImpact = [
  { currency: 'IRR/USD', change: '-42%', direction: 'down', detail: 'Rial in freefall on black market. Official rate suspended.' },
  { currency: 'SAR/USD', change: '-0.1%', direction: 'stable', detail: 'Peg holding. Saudi reserves adequate.' },
  { currency: 'TRY/USD', change: '-3.8%', direction: 'down', detail: 'Lira weakening on regional instability.' },
  { currency: 'AED/USD', change: '-0.05%', direction: 'stable', detail: 'Dirham peg stable. Safe haven flows.' },
  { currency: 'INR/USD', change: '-2.1%', direction: 'down', detail: 'Rupee pressured by oil import costs.' },
  { currency: 'CNY/USD', change: '-0.8%', direction: 'down', detail: 'Yuan slightly weaker. PBoC intervening.' },
];

const crossBorderAlerts = [
  { severity: 'CRITICAL', title: 'Strait of Hormuz transit suspended for commercial vessels', time: '2h ago', category: 'Shipping' },
  { severity: 'CRITICAL', title: 'OFAC issues emergency guidance on Iran-related sanctions expansion', time: '4h ago', category: 'Compliance' },
  { severity: 'HIGH', title: 'Lloyd\'s of London suspends war risk coverage for Persian Gulf transit', time: '5h ago', category: 'Insurance' },
  { severity: 'HIGH', title: 'Container rates Asia→Europe surge 180% on Suez uncertainty', time: '6h ago', category: 'Freight' },
  { severity: 'HIGH', title: 'EU announces emergency oil reserve release of 50M barrels', time: '8h ago', category: 'Energy' },
  { severity: 'MEDIUM', title: 'India diverts 12 tankers to alternative crude sources', time: '10h ago', category: 'Trade' },
  { severity: 'MEDIUM', title: 'Turkish banks halt Iranian correspondent banking services', time: '12h ago', category: 'Finance' },
  { severity: 'MEDIUM', title: 'WTO emergency consultation on trade disruption measures', time: '14h ago', category: 'Policy' },
  { severity: 'LOW', title: 'Singapore LNG spot market sees 25% volume increase', time: '16h ago', category: 'Energy' },
];

// ============================================================
// Business news hook
// ============================================================

interface TradeArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  sentiment: number;
}

const fallbackTradeArticles: TradeArticle[] = [
  { id: 'fb1', title: 'Global shipping reroutes around Strait of Hormuz as insurance premiums spike 300%', url: 'https://reuters.com', source: 'reuters.com', sentiment: -0.4 },
  { id: 'fb2', title: 'Brent crude surges past $96 as Iran conflict threatens key shipping lanes', url: 'https://reuters.com', source: 'reuters.com', sentiment: -0.3 },
  { id: 'fb3', title: 'OPEC emergency meeting called as Strait of Hormuz traffic halts', url: 'https://bloomberg.com', source: 'bloomberg.com', sentiment: -0.5 },
  { id: 'fb4', title: 'Container shipping rates explode as carriers avoid Red Sea and Persian Gulf', url: 'https://ft.com', source: 'ft.com', sentiment: -0.6 },
  { id: 'fb5', title: 'India and Japan scramble for alternative oil sources as Gulf routes disrupted', url: 'https://reuters.com', source: 'reuters.com', sentiment: -0.3 },
  { id: 'fb6', title: 'EU announces emergency oil reserve release amid Middle East supply fears', url: 'https://bbc.com', source: 'bbc.com', sentiment: -0.2 },
  { id: 'fb7', title: 'SWIFT restrictions expanded to cover additional Iranian financial institutions', url: 'https://ft.com', source: 'ft.com', sentiment: -0.4 },
  { id: 'fb8', title: 'Cross-border payment delays surge as sanctions compliance checks intensify', url: 'https://reuters.com', source: 'reuters.com', sentiment: -0.3 },
  { id: 'fb9', title: 'Natural gas futures spike across Europe on Middle East supply disruption fears', url: 'https://bloomberg.com', source: 'bloomberg.com', sentiment: -0.5 },
  { id: 'fb10', title: 'Global trade finance costs rise 40% for Middle East corridor transactions', url: 'https://ft.com', source: 'ft.com', sentiment: -0.4 },
];

function useTradeNews() {
  return useQuery({
    queryKey: ['trade-news'],
    queryFn: async (): Promise<TradeArticle[]> => {
      try {
        const data = await fetchGdeltTopicArticles('iran oil trade shipping sanctions hormuz');
        const raw: Record<string, unknown>[] = Array.isArray(data?.articles) ? data.articles : [];
        if (raw.length > 0) {
          return raw.slice(0, 10).map((a: Record<string, unknown>, i: number) => ({
            id: `trade_${i}`,
            title: String(a.title || ''),
            url: String(a.url || ''),
            source: String(a.domain || 'Unknown'),
            sentiment: analyzeSentiment(String(a.title || '')).comparative,
          }));
        }
      } catch { /* fallback */ }
      return fallbackTradeArticles;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================
// Component
// ============================================================

const statusColor: Record<string, string> = {
  CRITICAL: '#DC2626', HIGH: '#D97706', MEDIUM: '#2563EB', LOW: '#16A34A',
  BLOCKED: '#DC2626', 'HIGH RISK': '#D97706', DISRUPTED: '#D97706',
  MONITORING: '#2563EB', NORMAL: '#16A34A', SEVERE: '#DC2626',
  'LOW-MOD': '#2563EB',
};

export default function BusinessImpact() {
  const tradeNews = useTradeNews();
  const [activeTab, setActiveTab] = useState<'overview' | 'corridors' | 'sanctions' | 'merkantis'>('overview');

  const tabs = [
    { key: 'overview' as const, label: 'Trade Overview' },
    { key: 'corridors' as const, label: 'Trade Corridors' },
    { key: 'sanctions' as const, label: 'Sanctions & Compliance' },
    { key: 'merkantis' as const, label: 'Merkantis Impact' },
  ];

  const avgTradeImpact = useMemo(() => {
    const total = tradeImpactSectors.reduce((s, t) => s + t.impact, 0);
    return (total / tradeImpactSectors.length).toFixed(1);
  }, []);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
          Business Impact & Cross-Border Trade
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse-dot" />
          <span className="font-mono text-[11px] text-[#DC2626]">TRADE DISRUPTION LEVEL: CRITICAL</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-medium border rounded-[6px] cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#111827] text-white border-[#111827]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="card p-3 sm:p-4">
              <SectionHeader>Brent Crude</SectionHeader>
              <div className="text-[24px] sm:text-[28px] font-bold font-mono leading-none text-[#D97706]">
                ${brentData[brentData.length - 1].price}
              </div>
              <div className="text-[11px] text-[#DC2626] mt-1">+$8.40 (+9.6%) since conflict</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Avg Trade Impact</SectionHeader>
              <div className="text-[24px] sm:text-[28px] font-bold font-mono leading-none text-[#DC2626]">{avgTradeImpact}%</div>
              <div className="text-[11px] text-[#6B7280] mt-1">across 8 major sectors</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Freight Rate Index</SectionHeader>
              <div className="text-[24px] sm:text-[28px] font-bold font-mono leading-none text-[#D97706]">
                ${shippingData[shippingData.length - 1].price.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#DC2626] mt-1">+180% from pre-conflict</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Chokepoints at Risk</SectionHeader>
              <div className="text-[24px] sm:text-[28px] font-bold font-mono leading-none text-[#DC2626]">
                {chokepoints.filter((c) => c.risk >= 6).length}/{chokepoints.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">above elevated risk threshold</div>
            </div>
          </div>

          {/* Commodity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Brent Crude (15-Day)</SectionHeader>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={brentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={monoTick} />
                  <YAxis tick={monoTick} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} />
                  <Area type="monotone" dataKey="price" stroke="#D97706" fill="#D97706" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <SectionHeader>Container Freight Index (15-Day)</SectionHeader>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={shippingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={monoTick} />
                  <YAxis tick={monoTick} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} formatter={(v) => `$${Number(v ?? 0).toLocaleString()}`} />
                  <Area type="monotone" dataKey="price" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Impact by Sector + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Trade Impact by Sector</SectionHeader>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={tradeImpactSectors} layout="vertical" margin={{ left: 5, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={monoTick} domain={[-45, 0]} />
                  <YAxis type="category" dataKey="sector" tick={{ ...monoTick, fill: '#6B7280', fontSize: 9 }} width={90} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 4 }}
                    formatter={(v) => `${v ?? 0}%`}
                    labelFormatter={(label: unknown) => {
                      const l = String(label);
                      const s = tradeImpactSectors.find((t) => t.sector === l);
                      return s ? `${l} (${s.volume})` : l;
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 3, 3, 0]}>
                    {tradeImpactSectors.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <SectionHeader>Cross-Border Trade Alerts</SectionHeader>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {crossBorderAlerts.map((alert, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded-[4px] border border-[#E5E7EB] hover:bg-gray-50 transition-colors">
                    <span
                      className="shrink-0 px-1.5 py-0.5 rounded-[3px] font-mono self-start"
                      style={{
                        fontSize: '9px', fontWeight: 700,
                        color: statusColor[alert.severity] || '#6B7280',
                        backgroundColor: (statusColor[alert.severity] || '#6B7280') + '15',
                      }}
                    >
                      {alert.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[#111827] leading-snug">{alert.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#9CA3AF] font-mono">{alert.time}</span>
                        <span className="text-[10px] text-[#6B7280]">{alert.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Currency Impact + Trade News */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Currency Impact</SectionHeader>
              <div className="space-y-2">
                {currencyImpact.map((c) => (
                  <div key={c.currency} className="flex items-center gap-3 p-2 border border-[#E5E7EB] rounded-[4px]">
                    <span className="font-mono text-[12px] font-bold text-[#111827] w-16 shrink-0">{c.currency}</span>
                    <span
                      className="font-mono text-[13px] font-bold w-12 shrink-0"
                      style={{ color: c.direction === 'down' ? '#DC2626' : c.direction === 'stable' ? '#16A34A' : '#D97706' }}
                    >
                      {c.change}
                    </span>
                    <span className="text-[11px] text-[#6B7280] flex-1">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <SectionHeader>Trade & Business News</SectionHeader>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {(tradeNews.data || fallbackTradeArticles).map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-[4px] border border-[#E5E7EB] hover:bg-gray-50 no-underline transition-colors"
                  >
                    <div className="text-[12px] font-medium text-[#111827] leading-snug">{article.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#6B7280]">{article.source}</span>
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: article.sentiment < -0.3 ? '#DC2626' : article.sentiment > 0.1 ? '#16A34A' : '#D97706' }}
                      >
                        {article.sentiment > 0 ? '+' : ''}{article.sentiment.toFixed(2)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ CORRIDORS TAB ============ */}
      {activeTab === 'corridors' && (
        <>
          {/* Trade Corridor Map */}
          <div className="card p-4 mb-4">
            <SectionHeader>Global Trade Corridor Status</SectionHeader>
            <div className="h-[300px] sm:h-[450px] mt-2">
              <MapContainer center={[20, 55]} zoom={3} scrollWheelZoom={true} dragging={true} style={{ height: '100%', width: '100%', borderRadius: '6px' }}>
                <TileLayer attribution='&copy; CARTO' url={CARTO_TILES} />
                {/* Trade routes */}
                {tradeRoutes.map((route, i) => (
                  <Polyline
                    key={`route-${i}`}
                    positions={route}
                    color={i === 2 ? '#16A34A' : '#DC2626'}
                    weight={i === 2 ? 2 : 3}
                    opacity={0.5}
                    dashArray={i === 2 ? '8 4' : undefined}
                  />
                ))}
                {/* Chokepoints */}
                {chokepoints.map((cp) => (
                  <CircleMarker
                    key={cp.name}
                    center={[cp.lat, cp.lng]}
                    radius={cp.risk * 2}
                    fillColor={cp.color}
                    fillOpacity={0.6}
                    color="#fff"
                    weight={2}
                  >
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong>{cp.name}</strong>
                        <span style={{ color: statusColor[cp.status], fontWeight: 700, fontSize: 11, marginLeft: 6 }}>{cp.status}</span>
                        <br />
                        <span style={{ fontSize: 11 }}>Flow: {cp.dailyBarrels} ({cp.pctGlobal} of global)</span>
                        <br />
                        <span style={{ fontSize: 11 }}>{cp.detail}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                <span className="w-6 h-0.5 bg-[#DC2626]" /> Active route
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                <span className="w-6 h-0.5 bg-[#16A34A]" style={{ borderBottom: '2px dashed #16A34A', height: 0, width: 24 }} /> Reroute
              </span>
              {chokepoints.map((cp) => (
                <span key={cp.name} className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cp.color }} />
                  {cp.name}
                </span>
              ))}
            </div>
          </div>

          {/* Chokepoint Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {chokepoints.map((cp) => (
              <div key={cp.name} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cp.color }} />
                    <span className="text-[13px] font-bold text-[#111827]">{cp.name}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-[3px] font-mono"
                    style={{
                      fontSize: '10px', fontWeight: 700,
                      color: statusColor[cp.status],
                      backgroundColor: (statusColor[cp.status]) + '15',
                    }}
                  >
                    {cp.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-[10px] text-[#9CA3AF]">Daily Flow</div>
                    <div className="font-mono text-[13px] font-bold text-[#111827]">{cp.dailyBarrels}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#9CA3AF]">Global Share</div>
                    <div className="font-mono text-[13px] font-bold text-[#111827]">{cp.pctGlobal}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[#6B7280] leading-relaxed">{cp.detail}</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${cp.risk * 10}%`, backgroundColor: cp.color }} />
                </div>
                <div className="text-[9px] font-mono text-[#9CA3AF] mt-1">Risk: {cp.risk}/10</div>
              </div>
            ))}
          </div>

          {/* Additional commodity charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Gold Price (15-Day)</SectionHeader>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={goldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={monoTick} />
                  <YAxis tick={monoTick} domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} formatter={(v) => `$${Number(v ?? 0).toLocaleString()}`} />
                  <Line type="monotone" dataKey="price" stroke="#D97706" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <SectionHeader>Natural Gas (Henry Hub, 15-Day)</SectionHeader>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={natGasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={monoTick} />
                  <YAxis tick={monoTick} domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4, fontFamily: 'JetBrains Mono' }} formatter={(v) => `$${v ?? 0}`} />
                  <Line type="monotone" dataKey="price" stroke="#2563EB" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ============ SANCTIONS TAB ============ */}
      {activeTab === 'sanctions' && (
        <>
          {/* Sanctions overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="card p-3 sm:p-4">
              <SectionHeader>Active Sanctions</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#DC2626]">{sanctionsTracker.length}</div>
              <div className="text-[11px] text-[#6B7280] mt-1">major designations</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>New Since Conflict</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#D97706]">
                {sanctionsTracker.filter((s) => s.date === 'New' || s.date === 'Expanded').length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">expanded or new</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>SWIFT Blocks</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#DC2626]">Full</div>
              <div className="text-[11px] text-[#6B7280] mt-1">Iranian banks disconnected</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Secondary Risk</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#D97706]">HIGH</div>
              <div className="text-[11px] text-[#6B7280] mt-1">third-party enforcement active</div>
            </div>
          </div>

          {/* Sanctions Tracker Table */}
          <div className="card p-4 mb-4">
            <SectionHeader>Sanctions Tracker</SectionHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Entity</th>
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Type</th>
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Status</th>
                    <th className="py-2 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctionsTracker.map((s, i) => (
                    <tr key={i} className="border-b border-[#F3F4F6] hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-3 font-medium text-[#111827]">{s.entity}</td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">{s.type}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className="px-1.5 py-0.5 rounded-[3px] font-mono"
                          style={{
                            fontSize: '10px', fontWeight: 700,
                            color: s.date === 'New' ? '#DC2626' : s.date === 'Expanded' ? '#D97706' : '#6B7280',
                            backgroundColor: s.date === 'New' ? '#FEF2F2' : s.date === 'Expanded' ? '#FFFBEB' : '#F3F4F6',
                          }}
                        >
                          {s.date}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#6B7280] text-[11px]">{s.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Compliance Action Items</SectionHeader>
              <div className="space-y-2">
                {[
                  { priority: 'URGENT', action: 'Screen all counterparties against updated OFAC SDN list', deadline: 'Immediate' },
                  { priority: 'URGENT', action: 'Halt any in-progress payments to/through Iranian intermediaries', deadline: 'Immediate' },
                  { priority: 'HIGH', action: 'Review supply chain for Iran-origin goods or components', deadline: '48 hours' },
                  { priority: 'HIGH', action: 'Update KYC/AML procedures for Middle East corridor transactions', deadline: '72 hours' },
                  { priority: 'MEDIUM', action: 'Assess secondary sanctions exposure through UAE/Turkey intermediaries', deadline: '1 week' },
                  { priority: 'MEDIUM', action: 'Document force majeure claims for affected contracts', deadline: '1 week' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 p-2 border border-[#E5E7EB] rounded-[4px]">
                    <span className="shrink-0 px-1.5 py-0.5 rounded-[3px] font-mono self-start" style={{
                      fontSize: '9px', fontWeight: 700,
                      color: item.priority === 'URGENT' ? '#DC2626' : item.priority === 'HIGH' ? '#D97706' : '#2563EB',
                      backgroundColor: item.priority === 'URGENT' ? '#FEF2F2' : item.priority === 'HIGH' ? '#FFFBEB' : '#EFF6FF',
                    }}>
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <div className="text-[12px] text-[#111827]">{item.action}</div>
                      <div className="text-[10px] font-mono text-[#9CA3AF] mt-0.5">Deadline: {item.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <SectionHeader>Affected Payment Corridors</SectionHeader>
              <div className="space-y-2">
                {[
                  { corridor: 'USD → IRR', status: 'BLOCKED', detail: 'Complete SWIFT disconnection. No clearing.' },
                  { corridor: 'EUR → IRR', status: 'BLOCKED', detail: 'INSTEX mechanism suspended during hostilities.' },
                  { corridor: 'AED → IRR', status: 'SUSPENDED', detail: 'UAE banks halting hawala and correspondent services.' },
                  { corridor: 'TRY → IRR', status: 'RESTRICTED', detail: 'Turkish banks limiting to humanitarian goods only.' },
                  { corridor: 'CNY → IRR', status: 'LIMITED', detail: 'CIPS channel constrained. PBoC monitoring closely.' },
                  { corridor: 'INR → IRR', status: 'RESTRICTED', detail: 'Rupee-rial mechanism paused. Oil payments in escrow.' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 border border-[#E5E7EB] rounded-[4px]">
                    <span className="font-mono text-[12px] font-bold text-[#111827] w-20 shrink-0">{c.corridor}</span>
                    <span className="px-1.5 py-0.5 rounded-[3px] font-mono shrink-0" style={{
                      fontSize: '9px', fontWeight: 700,
                      color: c.status === 'BLOCKED' ? '#DC2626' : c.status === 'SUSPENDED' ? '#D97706' : '#2563EB',
                      backgroundColor: c.status === 'BLOCKED' ? '#FEF2F2' : c.status === 'SUSPENDED' ? '#FFFBEB' : '#EFF6FF',
                    }}>
                      {c.status}
                    </span>
                    <span className="text-[11px] text-[#6B7280] flex-1">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ MERKANTIS TAB ============ */}
      {activeTab === 'merkantis' && (
        <>
          {/* Merkantis Header */}
          <div className="card p-4 sm:p-6 mb-4 border-l-[4px] border-l-[#2563EB]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px', margin: 0 }}>
                  Merkantis — Conflict Impact Assessment
                </h2>
                <p className="text-[13px] text-[#6B7280] mt-1 mb-0">
                  Cross-border trade operations exposure analysis for the Iran-Middle East conflict
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-[4px] bg-[#FEF2F2] text-[#DC2626] font-mono text-[11px] font-bold">
                  RISK LEVEL: ELEVATED
                </span>
              </div>
            </div>
          </div>

          {/* Merkantis KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="card p-3 sm:p-4">
              <SectionHeader>Affected Trade Routes</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#DC2626]">4</div>
              <div className="text-[11px] text-[#6B7280] mt-1">of 6 major corridors disrupted</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Client Exposure</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#D97706]">HIGH</div>
              <div className="text-[11px] text-[#6B7280] mt-1">Middle East & Asia clients</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Payment Delays</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#D97706]">+5-12d</div>
              <div className="text-[11px] text-[#6B7280] mt-1">avg settlement delay increase</div>
            </div>
            <div className="card p-3 sm:p-4">
              <SectionHeader>Compliance Actions</SectionHeader>
              <div className="text-[28px] font-bold font-mono leading-none text-[#DC2626]">8</div>
              <div className="text-[11px] text-[#6B7280] mt-1">pending reviews required</div>
            </div>
          </div>

          {/* Merkantis Trade Corridor Status */}
          <div className="card p-4 mb-4">
            <SectionHeader>Merkantis Cross-Border Trade Corridors</SectionHeader>
            <div className="space-y-2 mt-2">
              {[
                { route: 'Europe → Gulf States', volume: 'Primary corridor', status: 'DISRUPTED', impact: 'HIGH',
                  detail: 'UAE/Saudi payments delayed 5-8 days. Shipping surcharges applied. LC confirmations taking 3x longer.', action: 'Switch to confirmed LCs. Add force majeure clauses.' },
                { route: 'Europe → South Asia', volume: 'High volume', status: 'IMPACTED', impact: 'MODERATE',
                  detail: 'Indian rupee payment corridor slower. Alternative shipping routes add 10-14 days. Insurance costs up 120%.', action: 'Reroute via Malacca. Hedge INR exposure.' },
                { route: 'Europe → East Asia', volume: 'Core corridor', status: 'MONITORING', impact: 'LOW-MOD',
                  detail: 'Indirect impact via energy costs and shipping delays. China trade finance channels stable.', action: 'Monitor Suez transit times. Pre-position inventory.' },
                { route: 'Europe → Turkey', volume: 'Regional', status: 'IMPACTED', impact: 'MODERATE',
                  detail: 'Turkish banks limiting Iran-adjacent transactions. Lira volatility increasing hedging costs.', action: 'Enhanced KYC on Turkish counterparties. Lira hedges.' },
                { route: 'Intra-Middle East', volume: 'Significant', status: 'SEVERELY DISRUPTED', impact: 'CRITICAL',
                  detail: 'Iran-related trade halted. Gulf-to-Gulf payments delayed. Airspace closures affecting document delivery.', action: 'Suspend new Iran-related contracts. Activate BCP.' },
                { route: 'Africa → Middle East', volume: 'Growing', status: 'DISRUPTED', impact: 'HIGH',
                  detail: 'Red Sea shipping risks from Houthi attacks. Insurance withdrawal for Yemen-adjacent waters.', action: 'Reroute via Cape of Good Hope. Alert African partners.' },
              ].map((corridor, i) => (
                <div key={i} className="p-3 border border-[#E5E7EB] rounded-[6px] hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-[#111827]">{corridor.route}</span>
                      <span className="text-[10px] text-[#9CA3AF]">({corridor.volume})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-[3px] font-mono" style={{
                        fontSize: '9px', fontWeight: 700,
                        color: statusColor[corridor.impact] || '#6B7280',
                        backgroundColor: (statusColor[corridor.impact] || '#6B7280') + '15',
                      }}>
                        {corridor.impact}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[3px] font-mono bg-gray-100 text-[#6B7280]" style={{ fontSize: '9px', fontWeight: 700 }}>
                        {corridor.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#6B7280] mb-2">{corridor.detail}</div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[10px] font-bold text-[#2563EB] shrink-0 mt-px">ACTION:</span>
                    <span className="text-[11px] text-[#2563EB]">{corridor.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merkantis Action Plan + Revenue Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            <div className="card p-4">
              <SectionHeader>Immediate Action Plan</SectionHeader>
              <div className="space-y-2">
                {[
                  { done: true, text: 'Activate Business Continuity Plan for Middle East operations' },
                  { done: true, text: 'Screen all active transactions against expanded sanctions list' },
                  { done: true, text: 'Notify affected clients of potential settlement delays' },
                  { done: false, text: 'Review and update force majeure clauses in active contracts' },
                  { done: false, text: 'Engage alternative correspondent banks for Gulf payment routing' },
                  { done: false, text: 'Conduct enhanced due diligence on all Iran-adjacent counterparties' },
                  { done: false, text: 'Establish emergency hedging positions for currency exposure' },
                  { done: false, text: 'Brief leadership on worst-case scenario financial impact' },
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-2 p-2 rounded-[4px] hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked={item.done} className="w-3.5 h-3.5 mt-0.5 accent-[#2563EB]" />
                    <span className={`text-[12px] ${item.done ? 'text-[#9CA3AF] line-through' : 'text-[#111827]'}`}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <SectionHeader>Estimated Revenue Impact</SectionHeader>
              <div className="space-y-3 mt-1">
                {[
                  { label: 'Gulf State Trade Volume', baseline: '100%', current: '35%', color: '#DC2626' },
                  { label: 'South Asia Corridor', baseline: '100%', current: '72%', color: '#D97706' },
                  { label: 'Turkey & CIS', baseline: '100%', current: '68%', color: '#D97706' },
                  { label: 'East Asia', baseline: '100%', current: '91%', color: '#16A34A' },
                  { label: 'Europe (domestic)', baseline: '100%', current: '96%', color: '#16A34A' },
                  { label: 'Africa', baseline: '100%', current: '60%', color: '#DC2626' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-[#374151]">{item.label}</span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: item.color }}>{item.current}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: item.current, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-[#111827]">Overall Portfolio Impact</span>
                    <span className="font-mono text-[14px] font-bold text-[#DC2626]">-22% estimated</span>
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-1">Based on corridor-weighted revenue model. Assumes 4-week conflict duration.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Merkantis Risk Matrix */}
          <div className="card p-4 mb-4">
            <SectionHeader>Cross-Border Risk Matrix</SectionHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Risk Category</th>
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Probability</th>
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Impact</th>
                    <th className="py-2 pr-3 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Score</th>
                    <th className="py-2 text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { risk: 'Sanctions non-compliance', prob: 'HIGH', impact: 'CRITICAL', score: 9, mitigation: 'Enhanced screening, legal review of all ME transactions' },
                    { risk: 'Payment corridor disruption', prob: 'VERY HIGH', impact: 'HIGH', score: 9, mitigation: 'Alternative routing via non-affected correspondents' },
                    { risk: 'Counterparty default', prob: 'MODERATE', impact: 'HIGH', score: 7, mitigation: 'Credit insurance, reduced exposure limits' },
                    { risk: 'Currency devaluation (TRY, INR)', prob: 'HIGH', impact: 'MODERATE', score: 7, mitigation: 'FX hedging, USD-denominated contracts' },
                    { risk: 'Document/goods in transit delays', prob: 'VERY HIGH', impact: 'MODERATE', score: 8, mitigation: 'Digital documentation, alternative logistics' },
                    { risk: 'Reputational (Iran-adjacent dealings)', prob: 'MODERATE', impact: 'HIGH', score: 6, mitigation: 'Proactive disclosure, enhanced compliance posture' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#F3F4F6] hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-3 font-medium text-[#111827]">{row.risk}</td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">{row.prob}</td>
                      <td className="py-2.5 pr-3 text-[#6B7280]">{row.impact}</td>
                      <td className="py-2.5 pr-3">
                        <span className="font-mono font-bold" style={{
                          color: row.score >= 8 ? '#DC2626' : row.score >= 6 ? '#D97706' : '#2563EB',
                        }}>
                          {row.score}/10
                        </span>
                      </td>
                      <td className="py-2.5 text-[11px] text-[#6B7280]">{row.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
