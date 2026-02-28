import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCombinedNews, useGdeltTimeline, useGdeltTone } from '../hooks/useGdeltArticles';
import { MetricSkeleton } from '../components/common/LoadingSkeleton';

// ─── GENERIC DATA MODEL ────────────────────────────────────────────────────────
// All conflict-specific data lives in these objects. Swap them out for any conflict.

interface Conflict {
  id: string;
  name: string;
  region: string;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WATCH';
  active: boolean;
}

interface SnapshotData {
  headline: string;
  subDetails: string[];
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WATCH';
  lastUpdated: string;
}

interface TimelineNode {
  date: string;
  label: string;
  detail: string;
  isCritical: boolean;
}

interface Theater {
  name: string;
  status: 'ACTIVE' | 'TENSE' | 'MONITORING';
  lastEvent: string;
  assessment: string;
}

interface Update {
  id: string;
  category: 'military' | 'diplomacy' | 'humanitarian' | 'economic';
  headline: string;
  source: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  url?: string;
}

interface WatchlistItem {
  label: string;
  status: 'alert' | 'warn' | 'stable';
  detail: string;
}

interface Alert {
  time: string;
  text: string;
  level: 'critical' | 'warning' | 'info';
}

// ─── MOCK CONFLICTS ────────────────────────────────────────────────────────────

const conflicts: Conflict[] = [
  { id: 'iran-2026', name: 'Iran Conflict', region: 'Middle East', severity: 'CRITICAL', active: true },
  { id: 'ukraine-2022', name: 'Ukraine War', region: 'Eastern Europe', severity: 'HIGH', active: true },
  { id: 'sudan-2023', name: 'Sudan Civil War', region: 'East Africa', severity: 'HIGH', active: true },
  { id: 'myanmar-2021', name: 'Myanmar Crisis', region: 'Southeast Asia', severity: 'ELEVATED', active: true },
  { id: 'gaza-2023', name: 'Gaza Conflict', region: 'Middle East', severity: 'CRITICAL', active: true },
];

// ─── IRAN CONFLICT DATA ────────────────────────────────────────────────────────

const snapshot: SnapshotData = {
  headline: 'Operation Epic Fury — Active Military Operations Against Iran',
  subDetails: [
    'US & Israel launch coordinated airstrikes on Iranian nuclear and military targets',
    'IRGC retaliates with ballistic missiles toward Israel and US bases in Iraq',
    'Gulf states close airspace — Strait of Hormuz shipping halted',
    'Brent crude surges past $96 — global markets in turmoil',
  ],
  severity: 'CRITICAL',
  lastUpdated: new Date().toISOString(),
};

const timeline: TimelineNode[] = [
  { date: 'Jan 8', label: 'Mass protests erupt across Iran', detail: 'Anti-government demonstrations in major cities', isCritical: false },
  { date: 'Jan 13', label: 'Iran warns "ready for war"', detail: 'IRGC commander issues warning to US and allies', isCritical: false },
  { date: 'Jan 28', label: 'US deploys carrier group', detail: 'USS Gerald Ford carrier strike group to Persian Gulf', isCritical: false },
  { date: 'Jan 29', label: 'EU labels IRGC terrorist org', detail: 'European Union designates IRGC as terrorist group', isCritical: false },
  { date: 'Feb 19', label: 'US could strike within days', detail: 'Pentagon sources confirm operational planning', isCritical: true },
  { date: 'Feb 26', label: 'Geneva talks fail', detail: 'Final diplomatic effort fails to prevent escalation', isCritical: true },
  { date: 'Feb 27', label: 'USS Ford off Israel coast', detail: 'Carrier positioned in Eastern Mediterranean', isCritical: false },
  { date: 'Feb 28', label: 'Operation Epic Fury begins', detail: 'Coordinated airstrikes on nuclear and military targets', isCritical: true },
  { date: 'Feb 28', label: 'IRGC retaliates', detail: 'Ballistic missiles launched from Iranian territory', isCritical: true },
  { date: 'Feb 28', label: 'Gulf airspace closed', detail: 'Qatar, Kuwait, Bahrain, UAE suspend flights', isCritical: true },
];

const theaters: Theater[] = [
  { name: 'Iran (Primary)', status: 'ACTIVE', lastEvent: 'Ongoing airstrikes on 14+ military installations', assessment: 'Multi-domain operations continuing. Air defense suppression phase.' },
  { name: 'Israel / Lebanon', status: 'ACTIVE', lastEvent: 'Hezbollah fires 200+ rockets into northern Israel', assessment: 'IDF northern command fully activated. Two-front conflict.' },
  { name: 'Iraq / Syria', status: 'ACTIVE', lastEvent: 'IRGC missile strikes on US bases', assessment: 'US forces under direct fire. Force protection elevated.' },
  { name: 'Yemen / Red Sea', status: 'TENSE', lastEvent: 'Houthi anti-ship missiles at USN vessels', assessment: 'Shipping lane interdiction ongoing. Insurance premiums spiking.' },
  { name: 'Persian Gulf / Hormuz', status: 'ACTIVE', lastEvent: 'Strait effectively closed to commercial traffic', assessment: '40+ tankers holding position. Oil supply chain disrupted.' },
  { name: 'Cyber Domain', status: 'TENSE', lastEvent: 'Iran internet at 4% — suspected state kill-switch', assessment: 'Attribution pending on infrastructure attacks.' },
];

const curatedUpdates: Update[] = [
  { id: 'u1', category: 'military', headline: 'Pentagon confirms sustained air operations entering new phase', source: 'reuters.com', time: '12m ago', severity: 'critical', url: 'https://reuters.com' },
  { id: 'u2', category: 'military', headline: 'IRGC launches retaliatory missile barrage at US forces in Iraq', source: 'apnews.com', time: '28m ago', severity: 'critical', url: 'https://apnews.com' },
  { id: 'u3', category: 'military', headline: 'Satellite imagery reveals damage to IRGC command centers near Tehran', source: 'nytimes.com', time: '45m ago', severity: 'high' },
  { id: 'u4', category: 'military', headline: 'IDF activates full northern command as Hezbollah escalation begins', source: 'timesofisrael.com', time: '1h ago', severity: 'high' },
  { id: 'u5', category: 'military', headline: 'Iron Dome intercepts 94% of incoming projectiles', source: 'jpost.com', time: '1.5h ago', severity: 'medium' },
  { id: 'u6', category: 'diplomacy', headline: 'UN Security Council holds emergency session on Iran', source: 'reuters.com', time: '20m ago', severity: 'critical' },
  { id: 'u7', category: 'diplomacy', headline: 'China and Russia block UN resolution calling for ceasefire', source: 'france24.com', time: '35m ago', severity: 'high' },
  { id: 'u8', category: 'diplomacy', headline: 'UK and France coordinate diplomatic push for ceasefire', source: 'theguardian.com', time: '1h ago', severity: 'medium' },
  { id: 'u9', category: 'diplomacy', headline: 'Turkey closes Incirlik airbase to US operations citing sovereignty', source: 'trtworld.com', time: '2h ago', severity: 'high' },
  { id: 'u10', category: 'diplomacy', headline: 'Iraqi PM condemns US strikes, demands withdrawal', source: 'arabnews.com', time: '2.5h ago', severity: 'medium' },
  { id: 'u11', category: 'humanitarian', headline: 'UNHCR: 200,000 displaced within Iran as strikes continue', source: 'reuters.com', time: '40m ago', severity: 'critical' },
  { id: 'u12', category: 'humanitarian', headline: 'Red Cross demands humanitarian corridor as supplies run low', source: 'icrc.org', time: '1h ago', severity: 'high' },
  { id: 'u13', category: 'humanitarian', headline: 'WHO: Isfahan hospitals overwhelmed, emergency supplies requested', source: 'who.int', time: '1.5h ago', severity: 'high' },
  { id: 'u14', category: 'humanitarian', headline: 'Turkey opens border for Iranian refugees', source: 'unhcr.org', time: '2h ago', severity: 'medium' },
  { id: 'u15', category: 'humanitarian', headline: 'Iran reports 89 civilian casualties, calls for investigation', source: 'aljazeera.com', time: '3h ago', severity: 'high' },
  { id: 'u16', category: 'economic', headline: 'Brent crude surges past $96 as Hormuz shipping halts', source: 'reuters.com', time: '15m ago', severity: 'critical' },
  { id: 'u17', category: 'economic', headline: 'Global shipping reroutes — insurance premiums spike 300%', source: 'reuters.com', time: '30m ago', severity: 'high' },
  { id: 'u18', category: 'economic', headline: 'European stock markets drop 4% on escalation fears', source: 'ft.com', time: '1h ago', severity: 'high' },
  { id: 'u19', category: 'economic', headline: 'US releases 30M barrels from Strategic Petroleum Reserve', source: 'apnews.com', time: '2h ago', severity: 'medium' },
  { id: 'u20', category: 'economic', headline: 'CSIS: Hormuz disruption could trigger global recession', source: 'csis.org', time: '3h ago', severity: 'medium' },
];

const situationSummary = `Active multi-domain military operations against Iran (Operation Epic Fury) are in progress as of Feb 28 2026. US and Israeli forces have struck 14+ military and nuclear-related targets. IRGC has launched retaliatory ballistic missile salvos toward Israel and US bases in Iraq/Syria. Gulf states have closed airspace. Strait of Hormuz is effectively blocked. Hezbollah has opened a second front from Lebanon. Oil prices have spiked to $96/bbl. Diplomatic efforts at the UN are blocked by Russia and China vetoes. Escalation risk remains extremely high with no ceasefire mechanism in place.`;

const watchlist: WatchlistItem[] = [
  { label: 'Strait of Hormuz', status: 'alert', detail: 'Effectively closed — 40+ tankers holding' },
  { label: 'Natanz Nuclear Site', status: 'alert', detail: 'Under strike — IAEA reports damage' },
  { label: 'Hezbollah / N. Israel', status: 'alert', detail: '200+ rockets fired — IDF responding' },
  { label: 'Red Sea / Houthis', status: 'warn', detail: 'Anti-ship missiles at USN vessels' },
  { label: 'Iran Internet', status: 'alert', detail: '4% connectivity — near-total blackout' },
  { label: 'US Bases Iraq/Syria', status: 'alert', detail: 'Under IRGC missile attack' },
  { label: 'Oil Markets', status: 'warn', detail: 'Brent $96+ — SPR release underway' },
  { label: 'Russia / China Posture', status: 'warn', detail: 'Blocking UNSC — rhetoric escalating' },
];

const alerts: Alert[] = [
  { time: '3m ago', text: 'FLASH: IRGC confirms second wave of missile launches toward Israel', level: 'critical' },
  { time: '12m ago', text: 'Pentagon confirms operations entering new phase', level: 'critical' },
  { time: '28m ago', text: 'Gulf states extend airspace closure for 24 hours', level: 'warning' },
  { time: '45m ago', text: 'NetBlocks: Iran internet drops to 4%', level: 'warning' },
  { time: '1h ago', text: 'OPEC calls emergency meeting for tomorrow', level: 'info' },
  { time: '1.5h ago', text: 'NATO Article 4 consultation underway', level: 'info' },
];

// ─── METRIC SPARKLINE DATA ─────────────────────────────────────────────────────

function generateSparkline(base: number, variance: number, trend: number, points = 24): { v: number }[] {
  return Array.from({ length: points }, (_, i) => ({
    v: base + trend * (i / points) + (Math.random() - 0.5) * variance,
  }));
}

const metricsConfig = [
  { label: 'Articles / Hour', value: '47', delta: '+340%', deltaType: 'danger' as const, sparkData: generateSparkline(12, 8, 35) },
  { label: 'Avg Sentiment', value: '-3.2', delta: 'Strongly negative', deltaType: 'danger' as const, sparkData: generateSparkline(-1.5, 1, -2) },
  { label: 'Active Theaters', value: '5', delta: '+2 escalated', deltaType: 'warning' as const, sparkData: generateSparkline(2, 0.5, 3) },
  { label: 'Sources Reporting', value: '127', delta: '+89 vs yesterday', deltaType: 'info' as const, sparkData: generateSparkline(38, 15, 90) },
  { label: 'Brent Crude', value: '$96.40', delta: '+$7.92 (+8.9%)', deltaType: 'danger' as const, sparkData: generateSparkline(88, 2, 8) },
  { label: 'Escalation Index', value: '9.1 / 10', delta: 'CRITICAL', deltaType: 'danger' as const, sparkData: generateSparkline(6, 0.5, 3) },
];

// ─── SEVERITY & STATUS HELPERS ──────────────────────────────────────────────────

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  HIGH: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  ELEVATED: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  WATCH: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  high: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  medium: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  low: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' },
  TENSE: { bg: '#FFFBEB', text: '#D97706', dot: '#D97706' },
  MONITORING: { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  alert: { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' },
  warn: { bg: '#FFFBEB', text: '#D97706', dot: '#D97706' },
  stable: { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A' },
};

const updateCategoryTabs = [
  { key: 'all', label: 'All' },
  { key: 'military', label: 'Military' },
  { key: 'diplomacy', label: 'Diplomacy' },
  { key: 'humanitarian', label: 'Humanitarian' },
  { key: 'economic', label: 'Economic' },
] as const;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────

function SeverityBadge({ level }: { level: string }) {
  const c = severityColors[level] || severityColors.WATCH;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 font-mono uppercase tracking-wider"
      style={{ fontSize: '10px', fontWeight: 700, color: c.text, backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: '3px' }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: c.text }} />
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = statusColors[status] || statusColors.MONITORING;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono uppercase"
      style={{ fontSize: '9px', fontWeight: 600, color: c.text, backgroundColor: c.bg, borderRadius: '3px' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  );
}

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

function SnapshotHero({ data }: { data: SnapshotData }) {
  return (
    <div className="card p-4 sm:p-5 mb-4 border-l-4" style={{ borderLeftColor: severityColors[data.severity]?.text || '#DC2626' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
        <SeverityBadge level={data.severity} />
        <span className="font-mono text-[10px] text-[#9CA3AF]">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} UTC
        </span>
      </div>
      <h2 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] leading-snug mb-3" style={{ letterSpacing: '-0.3px' }}>
        {data.headline}
      </h2>
      <ul className="space-y-1.5 m-0 p-0 list-none">
        {data.subDetails.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] sm:text-[13px] text-[#374151] leading-snug">
            <span className="w-1 h-1 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EscalationTimeline({ nodes }: { nodes: TimelineNode[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="card p-4 mb-4">
      <h3 className="section-header mb-3">Escalation Timeline</h3>
      <div className="relative">
        <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-[#E5E7EB]" />
        <div className="flex overflow-x-auto gap-0 pb-2" style={{ scrollbarWidth: 'thin' }}>
          {nodes.map((node, i) => (
            <button
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className="flex flex-col items-center min-w-[110px] sm:min-w-[130px] px-1 relative bg-transparent border-0 cursor-pointer group"
              style={{ outline: 'none' }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 z-10 transition-all ${
                  node.isCritical
                    ? 'bg-[#DC2626] border-[#DC2626]'
                    : selected === i
                      ? 'bg-[#111827] border-[#111827]'
                      : 'bg-white border-[#9CA3AF] group-hover:border-[#6B7280]'
                }`}
                style={selected === i ? { transform: 'scale(1.4)' } : undefined}
              />
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

function MetricCard({ label, value, delta, deltaType, sparkData }: {
  label: string; value: string; delta: string; deltaType: 'danger' | 'warning' | 'info'; sparkData: { v: number }[];
}) {
  const colorMap = { danger: '#DC2626', warning: '#D97706', info: '#2563EB' };
  const color = colorMap[deltaType];

  return (
    <div className="card p-3">
      <div className="section-header mb-1" style={{ fontSize: '9px' }}>{label}</div>
      <div className="text-[20px] sm:text-[24px] font-bold font-mono leading-none text-[#111827]">{value}</div>
      <div className="text-[10px] font-mono mt-0.5" style={{ color }}>{delta}</div>
      <MiniSparkline data={sparkData} color={color} />
    </div>
  );
}

function TheaterTable({ data }: { data: Theater[] }) {
  return (
    <div className="card mb-4 overflow-x-auto">
      <div className="p-4 pb-2">
        <h3 className="section-header mb-0">Operational Theaters</h3>
      </div>
      <table className="w-full text-left" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Theater</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Status</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF] hidden sm:table-cell">Last Event</th>
            <th className="px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF] hidden md:table-cell">Assessment</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
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

function UpdateCard({ update }: { update: Update }) {
  const sc = severityColors[update.severity] || severityColors.low;
  const content = (
    <div className="flex items-start gap-2.5 py-2.5 px-3 hover:bg-[#F9FAFB] transition-colors rounded-[4px]">
      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: sc.text }} />
      <div className="min-w-0">
        <div className="text-[12px] sm:text-[13px] font-medium text-[#111827] leading-snug">{update.headline}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-[#9CA3AF]">{update.source}</span>
          <span className="font-mono text-[10px] text-[#D1D5DB]">{update.time}</span>
        </div>
      </div>
    </div>
  );

  if (update.url) {
    return <a href={update.url} target="_blank" rel="noopener noreferrer" className="block no-underline">{content}</a>;
  }
  return content;
}

function CuratedUpdates({ updates }: { updates: Update[] }) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filtered = activeTab === 'all' ? updates : updates.filter(u => u.category === activeTab);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-header mb-0">Key Developments</h3>
        <Link to="/feed" className="text-[11px] text-[#2563EB] no-underline hover:underline font-medium">
          Full feed &rarr;
        </Link>
      </div>
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {updateCategoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border-0 cursor-pointer rounded-[3px] transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#111827] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {filtered.map((u) => <UpdateCard key={u.id} update={u} />)}
      </div>
    </div>
  );
}

function RightRail() {
  return (
    <div className="space-y-3">
      {/* Situation Summary */}
      <div className="card p-4">
        <h3 className="section-header mb-2">Situation Summary</h3>
        <p className="text-[12px] text-[#374151] leading-relaxed m-0">{situationSummary}</p>
      </div>

      {/* Watchlist */}
      <div className="card p-4">
        <h3 className="section-header mb-2">Watchlist</h3>
        <div className="space-y-2">
          {watchlist.map((item) => {
            const c = statusColors[item.status] || statusColors.stable;
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
      </div>

      {/* Alerts */}
      <div className="card p-4">
        <h3 className="section-header mb-2">Priority Alerts</h3>
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const c = a.level === 'critical' ? '#DC2626' : a.level === 'warning' ? '#D97706' : '#2563EB';
            return (
              <div key={i} className="flex items-start gap-2 py-1 border-l-2 pl-2" style={{ borderLeftColor: c }}>
                <div>
                  <div className="text-[11px] text-[#111827] leading-snug">{a.text}</div>
                  <div className="font-mono text-[9px] mt-0.5" style={{ color: c }}>{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── LIVE DATA INTEGRATION ─────────────────────────────────────────────────────

function LiveMetricsOverride() {
  const { articles, isLoading } = useCombinedNews();
  const tl = useGdeltTimeline();
  const tn = useGdeltTone();

  const liveMetrics = useMemo(() => {
    if (isLoading) return null;

    const count = articles.length;
    const avgSent = articles.length
      ? (articles.reduce((s, a) => s + a.sentiment, 0) / articles.length).toFixed(2)
      : '-3.2';
    const sources = new Set(articles.map(a => a.source)).size;

    // Build sparkline from timeline data
    const tlData = (tl.data || []).slice(-24).map((d: { count: number }) => ({ v: d.count }));
    const tnData = (tn.data || []).slice(-24).map((d: { tone: number }) => ({ v: d.tone }));

    return [
      {
        label: 'Articles (24h)',
        value: String(count || 47),
        delta: count > 20 ? `+${Math.round((count / 14 - 1) * 100)}% vs avg` : '+340%',
        deltaType: 'danger' as const,
        sparkData: tlData.length > 3 ? tlData : metricsConfig[0].sparkData,
      },
      {
        label: 'Avg Sentiment',
        value: avgSent,
        delta: Number(avgSent) < -1 ? 'Strongly negative' : Number(avgSent) < 0 ? 'Negative' : 'Neutral',
        deltaType: Number(avgSent) < -1 ? 'danger' as const : 'warning' as const,
        sparkData: tnData.length > 3 ? tnData : metricsConfig[1].sparkData,
      },
      {
        label: 'Active Theaters',
        value: '5',
        delta: '+2 escalated',
        deltaType: 'warning' as const,
        sparkData: metricsConfig[2].sparkData,
      },
      {
        label: 'Sources Reporting',
        value: String(sources || 127),
        delta: sources > 20 ? `Across ${sources} outlets` : '+89 vs yesterday',
        deltaType: 'info' as const,
        sparkData: metricsConfig[3].sparkData,
      },
      {
        label: 'Brent Crude',
        value: '$96.40',
        delta: '+$7.92 (+8.9%)',
        deltaType: 'danger' as const,
        sparkData: metricsConfig[4].sparkData,
      },
      {
        label: 'Escalation Index',
        value: '9.1 / 10',
        delta: 'CRITICAL',
        deltaType: 'danger' as const,
        sparkData: metricsConfig[5].sparkData,
      },
    ];
  }, [articles, isLoading, tl.data, tn.data]);

  if (isLoading || !liveMetrics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      {liveMetrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const [selectedConflict, setSelectedConflict] = useState(conflicts[0]);

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] m-0" style={{ letterSpacing: '-0.5px' }}>
            Conflict Command Center
          </h1>
          <SeverityBadge level={selectedConflict.severity} />
        </div>
        <div className="flex items-center gap-2">
          <span className="section-header" style={{ fontSize: '9px' }}>Active Conflict:</span>
          <select
            value={selectedConflict.id}
            onChange={(e) => setSelectedConflict(conflicts.find(c => c.id === e.target.value) || conflicts[0])}
            className="font-mono text-[11px] font-semibold text-[#111827] bg-white border border-[#E5E7EB] rounded-[4px] px-2 py-1 cursor-pointer hover:border-[#D1D5DB]"
            style={{ minHeight: 'auto' }}
          >
            {conflicts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Snapshot */}
      <SnapshotHero data={snapshot} />

      {/* Escalation Timeline */}
      <EscalationTimeline nodes={timeline} />

      {/* Live Metrics with sparklines */}
      <LiveMetricsOverride />

      {/* Theater Table */}
      <TheaterTable data={theaters} />

      {/* Main Content: Updates + Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <CuratedUpdates updates={curatedUpdates} />
        </div>
        <div>
          <RightRail />
        </div>
      </div>
    </div>
  );
}
