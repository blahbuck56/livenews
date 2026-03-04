// Dynamic data derivation from live GDELT article analysis.
// All "market" data is computed from article sentiment and keyword density
// so the dashboard always reflects current coverage rather than stale hardcoded values.

import type { Article } from '../hooks/useGdeltArticles';

// ─── KEYWORD SETS ────────────────────────────────────────────────────────────────

const OIL_KEYWORDS = /oil|crude|brent|petroleum|barrel|opec|refinery|fuel|gasoline|energy price/i;
const SHIPPING_KEYWORDS = /shipping|freight|container|tanker|vessel|maritime|port|logistics|cargo|transit/i;
const GOLD_KEYWORDS = /gold|precious|safe.?haven|bullion|commodity/i;
const GAS_KEYWORDS = /natural gas|lng|pipeline|gas price|gas export/i;
const MILITARY_KEYWORDS = /strike|attack|bomb|missile|kill|dead|destroy|explosion|war|invasion|offensive|retaliat|escalat|airstr|casualt|wound/i;
const HORMUZ_KEYWORDS = /hormuz|persian gulf|gulf shipping|iran.*strait/i;
const BAB_KEYWORDS = /bab.?el.?mandeb|red sea|houthi.*ship|yemen.*ship/i;
const SUEZ_KEYWORDS = /suez|canal.*transit|egypt.*ship/i;
const SANCTIONS_KEYWORDS = /sanction|embargo|swift|ofac|compliance|freeze|ban/i;
const DIPLOMACY_KEYWORDS = /ceasefire|negotiate|talks|diplomatic|peace|treaty|agreement/i;
const BLACKOUT_KEYWORDS = /internet|blackout|shutdown|connectivity|censorship|network/i;
const AIRSPACE_KEYWORDS = /airspace|flight|aviation|no.?fly|airport.*clos/i;

// ─── SENTIMENT-DRIVEN MARKET DATA ───────────────────────────────────────────────

interface MarketMetrics {
  oilPrice: number;
  oilChange: number;
  oilChangePct: number;
  goldPrice: number;
  goldChange: number;
  natGasPrice: number;
  natGasChange: number;
  freightIndex: number;
  freightChangePct: number;
}

const BASE_OIL = 82;       // Stable baseline Brent price
const BASE_GOLD = 2050;
const BASE_GAS = 2.6;
const BASE_FREIGHT = 1200;

export function computeMarketMetrics(articles: Article[]): MarketMetrics {
  if (articles.length === 0) {
    return {
      oilPrice: BASE_OIL, oilChange: 0, oilChangePct: 0,
      goldPrice: BASE_GOLD, goldChange: 0,
      natGasPrice: BASE_GAS, natGasChange: 0,
      freightIndex: BASE_FREIGHT, freightChangePct: 0,
    };
  }

  // Compute topic-specific sentiment
  const oilArticles = articles.filter(a => OIL_KEYWORDS.test(a.title));
  const shippingArticles = articles.filter(a => SHIPPING_KEYWORDS.test(a.title));
  const goldArticles = articles.filter(a => GOLD_KEYWORDS.test(a.title));
  const gasArticles = articles.filter(a => GAS_KEYWORDS.test(a.title));
  const militaryArticles = articles.filter(a => MILITARY_KEYWORDS.test(a.title));

  // Overall conflict intensity (0-1) from military keyword density
  const conflictIntensity = Math.min(1, militaryArticles.length / Math.max(1, articles.length) * 3);

  // Oil: negative sentiment + conflict intensity drives prices UP
  const oilSentiment = oilArticles.length > 0
    ? oilArticles.reduce((s, a) => s + a.sentiment, 0) / oilArticles.length
    : articles.reduce((s, a) => s + a.sentiment, 0) / articles.length;
  const oilPressure = Math.max(0, -oilSentiment) * 8 + conflictIntensity * 12;
  const oilPrice = Number((BASE_OIL + oilPressure).toFixed(2));
  const oilChange = Number((oilPrice - BASE_OIL).toFixed(2));
  const oilChangePct = Number(((oilChange / BASE_OIL) * 100).toFixed(1));

  // Gold: conflict = safe haven demand
  const goldPressure = conflictIntensity * 180 + Math.max(0, -oilSentiment) * 60;
  const goldPrice = Math.round(BASE_GOLD + goldPressure);
  const goldChange = goldPrice - BASE_GOLD;

  // Natural gas: linked to energy disruption
  const gasSentiment = gasArticles.length > 0
    ? gasArticles.reduce((s, a) => s + a.sentiment, 0) / gasArticles.length
    : oilSentiment * 0.5;
  const gasPressure = Math.max(0, -gasSentiment) * 0.3 + conflictIntensity * 0.4;
  const natGasPrice = Number((BASE_GAS + gasPressure).toFixed(2));
  const natGasChange = Number((natGasPrice - BASE_GAS).toFixed(2));

  // Freight: shipping sentiment + conflict drives rates UP
  const shippingSentiment = shippingArticles.length > 0
    ? shippingArticles.reduce((s, a) => s + a.sentiment, 0) / shippingArticles.length
    : oilSentiment * 0.7;
  const freightPressure = Math.max(0, -shippingSentiment) * 400 + conflictIntensity * 800;
  const freightIndex = Math.round(BASE_FREIGHT + freightPressure);
  const freightChangePct = Number((((freightIndex - BASE_FREIGHT) / BASE_FREIGHT) * 100).toFixed(0));

  return { oilPrice, oilChange, oilChangePct, goldPrice, goldChange, natGasPrice, natGasChange, freightIndex, freightChangePct };
}

// ─── COMMODITY TIMELINE ──────────────────────────────────────────────────────────

export function generateLiveCommodityTimeline(
  currentPrice: number,
  volatility: number,
  trendPerDay: number,
): { day: string; price: number }[] {
  const data: { day: string; price: number }[] = [];
  // Work backwards from current price
  let price = currentPrice;
  const points: { day: string; price: number }[] = [];
  for (let i = 0; i <= 14; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    points.unshift({ day: label, price: Number(price.toFixed(2)) });
    // Go back in time: subtract trend + noise
    price -= trendPerDay + (Math.sin(i * 1.3) * volatility * 0.3);
  }
  return points;
}

// ─── CHOKEPOINT RISK ─────────────────────────────────────────────────────────────

export interface ChokeStatus {
  status: string;
  risk: number;
  color: string;
  detail: string;
}

export function computeChokepointRisks(articles: Article[]): Record<string, ChokeStatus> {
  const hormuzCount = articles.filter(a => HORMUZ_KEYWORDS.test(a.title)).length;
  const babCount = articles.filter(a => BAB_KEYWORDS.test(a.title)).length;
  const suezCount = articles.filter(a => SUEZ_KEYWORDS.test(a.title)).length;
  const militaryCount = articles.filter(a => MILITARY_KEYWORDS.test(a.title)).length;
  const total = Math.max(1, articles.length);

  function riskFromMentions(mentions: number, baseFactor: number): ChokeStatus {
    const density = mentions / total;
    const militaryDensity = militaryCount / total;
    const risk = Math.min(10, Math.round((density * 30 + militaryDensity * 5) * baseFactor));

    if (risk >= 9) return { status: 'BLOCKED', risk, color: '#DC2626', detail: 'Effectively closed. Military operations ongoing. Insurance premiums surging.' };
    if (risk >= 7) return { status: 'HIGH RISK', risk, color: '#DC2626', detail: 'Active hostilities nearby. Shipping rerouting. Elevated insurance costs.' };
    if (risk >= 5) return { status: 'DISRUPTED', risk, color: '#D97706', detail: 'Operating with delays. Transit volumes reduced. Higher surcharges.' };
    if (risk >= 3) return { status: 'MONITORING', risk, color: '#2563EB', detail: 'Elevated awareness. Commercial shipping continues with caution.' };
    return { status: 'NORMAL', risk, color: '#16A34A', detail: 'No direct impact. Normal operations.' };
  }

  return {
    'Strait of Hormuz': riskFromMentions(hormuzCount, 3),
    'Bab el-Mandeb': riskFromMentions(babCount, 2.5),
    'Suez Canal': riskFromMentions(suezCount, 2),
    'Turkish Straits': riskFromMentions(0, 1),
    'Strait of Malacca': riskFromMentions(0, 0.5),
  };
}

// ─── SITUATION STATUS (for LiveFeed) ─────────────────────────────────────────────

export interface SituationItem {
  label: string;
  value: string;
  color: string;
}

export function computeSituationStatus(articles: Article[]): SituationItem[] {
  if (articles.length === 0) {
    return [
      { label: 'Status', value: 'LOADING...', color: '#9CA3AF' },
    ];
  }

  const total = articles.length;
  const militaryCount = articles.filter(a => MILITARY_KEYWORDS.test(a.title)).length;
  const diplomacyCount = articles.filter(a => DIPLOMACY_KEYWORDS.test(a.title)).length;
  const sanctionsCount = articles.filter(a => SANCTIONS_KEYWORDS.test(a.title)).length;
  const blackoutCount = articles.filter(a => BLACKOUT_KEYWORDS.test(a.title)).length;
  const airspaceCount = articles.filter(a => AIRSPACE_KEYWORDS.test(a.title)).length;
  const hormuzCount = articles.filter(a => HORMUZ_KEYWORDS.test(a.title)).length;

  const avgSent = articles.reduce((s, a) => s + a.sentiment, 0) / total;
  const militaryRatio = militaryCount / total;

  // Conflict status
  let conflictStatus: SituationItem;
  if (militaryRatio > 0.4) conflictStatus = { label: 'Conflict', value: 'ACTIVE COMBAT', color: '#DC2626' };
  else if (militaryRatio > 0.2) conflictStatus = { label: 'Conflict', value: 'ESCALATED', color: '#DC2626' };
  else if (militaryRatio > 0.1) conflictStatus = { label: 'Conflict', value: 'ELEVATED', color: '#D97706' };
  else conflictStatus = { label: 'Conflict', value: 'MONITORING', color: '#2563EB' };

  // Coverage intensity
  const coverageItem: SituationItem = {
    label: 'Coverage',
    value: total >= 50 ? 'SURGE' : total >= 25 ? 'HIGH' : 'NORMAL',
    color: total >= 50 ? '#DC2626' : total >= 25 ? '#D97706' : '#16A34A',
  };

  // Sentiment
  const sentLabel = avgSent < -0.5 ? 'STRONGLY NEGATIVE' : avgSent < -0.2 ? 'NEGATIVE' : avgSent < 0.2 ? 'MIXED' : 'POSITIVE';
  const sentColor = avgSent < -0.5 ? '#DC2626' : avgSent < -0.2 ? '#D97706' : avgSent < 0.2 ? '#D97706' : '#16A34A';
  const sentimentItem: SituationItem = { label: 'Tone', value: sentLabel, color: sentColor };

  // Internet/Blackout
  const blackoutItem: SituationItem = blackoutCount > 2
    ? { label: 'Internet', value: 'DISRUPTIONS REPORTED', color: '#DC2626' }
    : blackoutCount > 0
    ? { label: 'Internet', value: 'MONITORING', color: '#D97706' }
    : { label: 'Internet', value: 'NO REPORTS', color: '#16A34A' };

  // Airspace
  const airspaceItem: SituationItem = airspaceCount > 3
    ? { label: 'Airspace', value: 'RESTRICTIONS', color: '#DC2626' }
    : airspaceCount > 0
    ? { label: 'Airspace', value: 'ADVISORIES', color: '#D97706' }
    : { label: 'Airspace', value: 'NORMAL', color: '#16A34A' };

  // Shipping
  const shippingItem: SituationItem = hormuzCount > 3
    ? { label: 'Shipping', value: 'DISRUPTED', color: '#DC2626' }
    : hormuzCount > 0
    ? { label: 'Shipping', value: 'CAUTION', color: '#D97706' }
    : { label: 'Shipping', value: 'NORMAL', color: '#16A34A' };

  // Diplomacy
  const diplomacyItem: SituationItem = diplomacyCount > 3
    ? { label: 'Diplomacy', value: 'ACTIVE TALKS', color: '#16A34A' }
    : diplomacyCount > 0
    ? { label: 'Diplomacy', value: 'EFFORTS ONGOING', color: '#D97706' }
    : { label: 'Diplomacy', value: 'STALLED', color: '#DC2626' };

  // Sanctions
  const sanctionsItem: SituationItem = sanctionsCount > 2
    ? { label: 'Sanctions', value: 'EXPANDING', color: '#DC2626' }
    : sanctionsCount > 0
    ? { label: 'Sanctions', value: 'ACTIVE', color: '#D97706' }
    : { label: 'Sanctions', value: 'UNCHANGED', color: '#9CA3AF' };

  return [conflictStatus, coverageItem, sentimentItem, blackoutItem, airspaceItem, shippingItem, diplomacyItem, sanctionsItem];
}

// ─── CURRENCY IMPACT ─────────────────────────────────────────────────────────────

export interface CurrencyImpact {
  currency: string;
  change: string;
  direction: 'down' | 'stable' | 'up';
  detail: string;
}

export function computeCurrencyImpacts(articles: Article[]): CurrencyImpact[] {
  const avgSent = articles.length > 0
    ? articles.reduce((s, a) => s + a.sentiment, 0) / articles.length
    : 0;
  const conflictIntensity = Math.min(1,
    articles.filter(a => MILITARY_KEYWORDS.test(a.title)).length / Math.max(1, articles.length) * 3
  );

  // Higher conflict intensity = more pressure on regional currencies
  const irr = Math.min(60, Math.round(conflictIntensity * 45 + Math.max(0, -avgSent) * 15));
  const tryPct = (conflictIntensity * 3.5 + Math.max(0, -avgSent) * 1.5).toFixed(1);
  const inrPct = (conflictIntensity * 2 + Math.max(0, -avgSent) * 0.8).toFixed(1);
  const cnyPct = (conflictIntensity * 0.8 + Math.max(0, -avgSent) * 0.3).toFixed(1);

  return [
    { currency: 'IRR/USD', change: `-${irr}%`, direction: irr > 5 ? 'down' : 'stable', detail: irr > 20 ? 'Rial under severe pressure. Black market rates diverging.' : 'Rial weakening on conflict sentiment.' },
    { currency: 'SAR/USD', change: '-0.1%', direction: 'stable', detail: 'Peg holding. Saudi reserves adequate.' },
    { currency: 'TRY/USD', change: `-${tryPct}%`, direction: Number(tryPct) > 1 ? 'down' : 'stable', detail: Number(tryPct) > 2 ? 'Lira weakening on regional instability.' : 'Lira stable but under watch.' },
    { currency: 'AED/USD', change: '-0.05%', direction: 'stable', detail: 'Dirham peg stable. Safe haven flows.' },
    { currency: 'INR/USD', change: `-${inrPct}%`, direction: Number(inrPct) > 0.5 ? 'down' : 'stable', detail: Number(inrPct) > 1 ? 'Rupee pressured by oil import costs.' : 'Rupee stable with RBI support.' },
    { currency: 'CNY/USD', change: `-${cnyPct}%`, direction: Number(cnyPct) > 0.3 ? 'down' : 'stable', detail: Number(cnyPct) > 0.5 ? 'Yuan slightly weaker. PBoC monitoring.' : 'Yuan stable.' },
  ];
}

// ─── TRADE IMPACT SECTORS ────────────────────────────────────────────────────────

export interface TradeImpactSector {
  sector: string;
  impact: number;
  volume: string;
  status: string;
  color: string;
  detail: string;
}

export function computeTradeImpacts(articles: Article[]): TradeImpactSector[] {
  const oilDensity = articles.filter(a => OIL_KEYWORDS.test(a.title)).length / Math.max(1, articles.length);
  const shippingDensity = articles.filter(a => SHIPPING_KEYWORDS.test(a.title)).length / Math.max(1, articles.length);
  const conflictIntensity = Math.min(1,
    articles.filter(a => MILITARY_KEYWORDS.test(a.title)).length / Math.max(1, articles.length) * 3
  );

  const scale = (base: number, factor: number) => -Math.round(Math.abs(base) * (0.3 + conflictIntensity * factor));

  const sectors: TradeImpactSector[] = [
    { sector: 'Crude Oil & Gas', impact: scale(38, 0.8), volume: '$890B/yr', status: '', color: '', detail: 'Gulf oil transit disrupted. Spot prices spiking. LNG rerouting.' },
    { sector: 'Petrochemicals', impact: scale(29, 0.7), volume: '$420B/yr', status: '', color: '', detail: 'Feedstock shortages from energy disruption affecting downstream.' },
    { sector: 'Container Shipping', impact: scale(22, 0.6), volume: '$1.2T/yr', status: '', color: '', detail: 'Rerouting adding transit time and cost. Rate surcharges applied.' },
    { sector: 'Agriculture & Food', impact: scale(18, 0.5), volume: '$310B/yr', status: '', color: '', detail: 'Fertilizer shortages from petrochemical disruption. Shipments delayed.' },
    { sector: 'Automotive & Mfg', impact: scale(14, 0.4), volume: '$680B/yr', status: '', color: '', detail: 'Energy cost pass-through. Supply chain delays for components.' },
    { sector: 'Financial Services', impact: scale(12, 0.4), volume: '$2.1T/yr', status: '', color: '', detail: 'Sanctions compliance burden. Correspondent banking disrupted.' },
    { sector: 'Tech & Electronics', impact: scale(8, 0.3), volume: '$950B/yr', status: '', color: '', detail: 'Indirect via energy costs. Data center power costs affected.' },
    { sector: 'Pharma & Medical', impact: scale(5, 0.2), volume: '$380B/yr', status: '', color: '', detail: 'Humanitarian exemptions apply. Some logistics delays.' },
  ];

  // Assign status and color based on impact
  for (const s of sectors) {
    const abs = Math.abs(s.impact);
    if (abs >= 25) { s.status = 'SEVERE'; s.color = '#DC2626'; }
    else if (abs >= 15) { s.status = 'HIGH'; s.color = '#D97706'; }
    else if (abs >= 8) { s.status = 'MODERATE'; s.color = '#D97706'; }
    else if (abs >= 3) { s.status = 'LOW-MOD'; s.color = '#2563EB'; }
    else { s.status = 'LOW'; s.color = '#16A34A'; }
  }

  return sectors;
}

// ─── CROSS-BORDER ALERTS ─────────────────────────────────────────────────────────

export interface CrossBorderAlert {
  severity: string;
  title: string;
  time: string;
  category: string;
}

export function generateCrossBorderAlerts(articles: Article[]): CrossBorderAlert[] {
  // Take the most relevant trade/economic articles and format them as alerts
  const tradeArticles = articles.filter(a =>
    OIL_KEYWORDS.test(a.title) || SHIPPING_KEYWORDS.test(a.title) ||
    SANCTIONS_KEYWORDS.test(a.title) || /trade|market|economy|tariff|export|import/i.test(a.title)
  ).slice(0, 9);

  if (tradeArticles.length === 0) return [];

  return tradeArticles.map((a, i) => {
    const severity = a.sentiment < -0.4 ? 'CRITICAL' : a.sentiment < -0.2 ? 'HIGH' : a.sentiment < 0 ? 'MEDIUM' : 'LOW';
    const category = OIL_KEYWORDS.test(a.title) ? 'Energy'
      : SHIPPING_KEYWORDS.test(a.title) ? 'Shipping'
      : SANCTIONS_KEYWORDS.test(a.title) ? 'Compliance'
      : 'Trade';

    const pubDate = new Date(a.publishedAt);
    const hoursAgo = Math.max(1, Math.round((Date.now() - pubDate.getTime()) / 3600000));
    const time = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`;

    return { severity, title: a.title, time, category };
  });
}
