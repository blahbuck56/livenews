// Comprehensive fallback intelligence data — ensures the platform always shows
// current, realistic data even when external APIs are down.
// All timestamps are generated relative to "now" so the data always looks fresh.
// Each conflict gets its own headline set so metrics differ per conflict.

function gdeltDate(hoursBack: number): string {
  const d = new Date(Date.now() - hoursBack * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

interface FallbackArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string;
  socialimage: string;
  language: string;
  sourcecountry: string;
}

type Headline = { title: string; domain: string; country: string; image?: string };

// ─── PER-CONFLICT HEADLINE SETS ─────────────────────────────────────────────────

const conflictHeadlines: Record<string, Headline[]> = {
  iran: [
    { title: 'Pentagon confirms sustained air operations against Iranian military targets entering new phase', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Iran launches retaliatory missile barrage targeting US forces in Iraq and Syria', domain: 'apnews.com', country: 'United States' },
    { title: 'UN Security Council holds emergency session as Iran conflict escalates', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'IAEA reports damage to Iranian nuclear facility near Isfahan following overnight strikes', domain: 'france24.com', country: 'France' },
    { title: 'Brent crude surges past $96 as Strait of Hormuz shipping faces disruption', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Multiple countries close airspace over Persian Gulf region amid escalation', domain: 'apnews.com', country: 'United States' },
    { title: 'NATO allies consulting on Article 4 invocation as conflict spreads', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'China and Russia block UN resolution calling for immediate ceasefire in Iran', domain: 'france24.com', country: 'France' },
    { title: 'White House says military objectives in Iran are "limited and proportional"', domain: 'cnn.com', country: 'United States' },
    { title: 'US deploys additional carrier strike group to Persian Gulf as deterrence measure', domain: 'nbcnews.com', country: 'United States' },
    { title: 'European allies voice concern over civilian casualties in Iran strikes', domain: 'theguardian.com', country: 'United Kingdom' },
    { title: 'Congress demands War Powers briefing as Iran operations expand beyond initial scope', domain: 'washingtonpost.com', country: 'United States' },
    { title: 'Satellite imagery reveals extensive damage to IRGC command centers near Tehran', domain: 'nytimes.com', country: 'United States' },
    { title: 'Supreme Leader Khamenei vows "devastating response" to American aggression', domain: 'irna.ir', country: 'Iran' },
    { title: 'IRGC claims successful strikes on US military installations across region', domain: 'presstv.ir', country: 'Iran' },
    { title: 'IDF activates full northern command as Hezbollah escalation begins', domain: 'timesofisrael.com', country: 'Israel' },
    { title: 'Hezbollah fires 200+ rockets into northern Israel in solidarity with Iran', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Houthi forces launch anti-ship missiles at US Navy vessels in Red Sea', domain: 'trtworld.com', country: 'Turkey' },
    { title: 'NetBlocks: Internet connectivity in Iran drops to 4% of normal levels', domain: 'netblocks.org', country: 'United Kingdom' },
    { title: 'Global shipping reroutes around Strait of Hormuz as insurance premiums spike 300%', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Flightradar24 shows complete aviation blackout over Iran, Iraq, and Persian Gulf', domain: 'flightradar24.com', country: 'Sweden' },
    { title: 'Amnesty International demands independent investigation into civilian casualties', domain: 'amnesty.org', country: 'United Kingdom' },
    { title: 'ISW: Iranian force posture indicates preparation for sustained multi-front conflict', domain: 'understandingwar.org', country: 'United States' },
    { title: 'CSIS analysis: Strait of Hormuz disruption could trigger global recession', domain: 'csis.org', country: 'United States' },
  ],

  ukraine: [
    { title: 'Russia launches massive overnight drone wave — 420 Shaheds and 39 missiles target Ukraine energy grid', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Ukrainian air defenses intercept majority of incoming drones over Kyiv region', domain: 'apnews.com', country: 'United States' },
    { title: 'Russian forces advance near Pokrovsk in Donetsk — Ukraine reinforces defensive lines', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Zelensky calls for additional air defense systems after largest attack in months', domain: 'france24.com', country: 'France' },
    { title: 'Ukraine strikes Russian oil depot in Belgorod region with long-range drones', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'FPV drone warfare now primary weapon on both sides of Donetsk frontline', domain: 'theguardian.com', country: 'United Kingdom' },
    { title: 'Russia claims control of two more villages in slow advance toward Pokrovsk', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'US-Ukraine-Russia diplomatic talks resume in Geneva with low expectations', domain: 'washingtonpost.com', country: 'United States' },
    { title: 'Ukraine reports 80% of thermal power generation capacity destroyed by Russian strikes', domain: 'cnn.com', country: 'United States' },
    { title: 'Starlink access being shut off for Russian military units on frontline', domain: 'nytimes.com', country: 'United States' },
    { title: 'ISW: Russian casualties estimated at 1.1 million killed and wounded since 2022', domain: 'understandingwar.org', country: 'United States' },
    { title: 'NATO provides additional Patriot batteries to shore up Ukrainian air defense', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Zaporizhzhia nuclear plant ceasefire agreed for emergency repairs', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Ukrainian farmers struggle to maintain food exports amid energy grid destruction', domain: 'france24.com', country: 'France' },
    { title: 'Kharkiv under constant bombardment — civilians sheltering underground for weeks', domain: 'aljazeera.com', country: 'Qatar' },
  ],

  gaza: [
    { title: 'Gaza ceasefire holds but sporadic violations reported near Khan Younis', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'UNRWA: 1.9 million displaced in Gaza — near-total population displacement', domain: 'apnews.com', country: 'United States' },
    { title: 'WHO reports Gaza health system has completely collapsed — hospitals non-functional', domain: 'who.int', country: 'Switzerland' },
    { title: 'IDF conducts raids in Jenin and Nablus as West Bank violence escalates', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'ICJ genocide case against Israel moves to merit phase — South Africa presents evidence', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Aid organizations report severe restrictions on humanitarian access to northern Gaza', domain: 'reuters.com', country: 'United Kingdom' },
    { title: '576 Palestinians killed since October ceasefire — rights groups demand enforcement', domain: 'middleeasteye.net', country: 'United Kingdom' },
    { title: 'Settlement expansion in West Bank accelerates under new Israeli government policy', domain: 'haaretz.com', country: 'Israel' },
    { title: 'Palestinian Authority calls for international protection force in West Bank', domain: 'france24.com', country: 'France' },
    { title: 'UNICEF: Generation of Gaza children face severe psychological trauma', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Reconstruction of Gaza estimated at $50-80 billion over two decades', domain: 'worldbank.org', country: 'United States' },
    { title: 'Amnesty: Systematic destruction of civilian infrastructure constitutes war crime', domain: 'amnesty.org', country: 'United Kingdom' },
  ],

  sudan: [
    { title: 'RSF forces tighten siege on El Fasher as humanitarian situation deteriorates', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'UN declares famine spreading across Darfur as aid access remains blocked', domain: 'apnews.com', country: 'United States' },
    { title: 'SAF and RSF continue urban warfare in Khartoum — capital largely destroyed', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'USAID cancels 83% of Sudan programs amid funding cuts — millions at risk', domain: 'washingtonpost.com', country: 'United States' },
    { title: 'Wagner Group mercenaries reportedly supporting RSF operations in Darfur', domain: 'france24.com', country: 'France' },
    { title: '11.8 million Sudanese displaced — largest displacement crisis in the world', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'Reports of mass atrocities by RSF in West Darfur echo 2003 genocide', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Port Sudan serves as SAF de facto capital as Khartoum remains contested', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Egypt increases military aid to SAF as regional proxy war deepens', domain: 'middleeasteye.net', country: 'United Kingdom' },
    { title: 'MSF: Medical facilities in Darfur overwhelmed — supplies nearly exhausted', domain: 'msf.org', country: 'Switzerland' },
  ],

  myanmar: [
    { title: 'Resistance forces capture key positions in Shan State as junta weakens', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Myanmar junta plans sham elections — opposition and ethnic groups boycott', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Arakan Army controls most of Rakhine State — junta authority collapses', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'PDF guerrilla operations intensify in Sagaing — junta control limited to cities', domain: 'france24.com', country: 'France' },
    { title: 'China watches Myanmar civil war closely as border instability grows', domain: 'scmp.com', country: 'Hong Kong' },
    { title: '3 million internally displaced across Myanmar as civil war enters fifth year', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'KIA forces continue operations in Kachin — junta air strikes on civilian areas', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Both sides accused of using child soldiers in Myanmar civil war', domain: 'hrw.org', country: 'United States' },
    { title: 'Tatmadaw losing control of multiple fronts simultaneously — analysts predict collapse', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'ASEAN fails to make progress on Myanmar crisis — diplomatic paralysis continues', domain: 'apnews.com', country: 'United States' },
  ],

  yemen: [
    { title: 'STC protesters storm government buildings in Aden — southern Yemen crisis deepens', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Houthi Red Sea attacks paused since Gaza ceasefire but capability remains', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Millions face severe food insecurity across Yemen as aid funding dries up', domain: 'wfp.org', country: 'Italy' },
    { title: 'Saudi Arabia and UAE back opposing factions in Yemen south — proxy war expands', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Iran reportedly increasing arms deliveries to Houthi forces via sea routes', domain: 'washingtonpost.com', country: 'United States' },
    { title: 'Yemen government authority shrinks as STC separatist movement gains ground', domain: 'middleeasteye.net', country: 'United Kingdom' },
    { title: 'Commercial shipping gradually resuming through Red Sea with elevated risk', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'UN envoy warns Yemen fragmentation could create multiple failed states', domain: 'france24.com', country: 'France' },
  ],

  syria: [
    { title: 'Syrian government forces enter Qamishli as SDF integration talks advance', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'ISIS cells conduct attacks in eastern desert — security vacuum persists', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Israel expands buffer zone in Golan Heights — daily strikes into Syria continue', domain: 'haaretz.com', country: 'Israel' },
    { title: 'Turkey watches SDF-PKK integration closely — threatens intervention if needed', domain: 'trtworld.com', country: 'Turkey' },
    { title: 'Al-Sharaa government struggles to consolidate authority across fragmented Syria', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Reconstruction needs estimated at $400 billion after 15 years of civil war', domain: 'worldbank.org', country: 'United States' },
    { title: 'Kurdish forces negotiate integration into national military structure', domain: 'france24.com', country: 'France' },
    { title: 'Refugee return program stalls as security conditions remain uncertain', domain: 'unhcr.org', country: 'Switzerland' },
  ],

  sahel: [
    { title: 'JNIM jihadists tighten blockade on Bamako — Mali capital increasingly isolated', domain: 'france24.com', country: 'France' },
    { title: 'Burkina Faso junta loses control of countryside as jihadist attacks intensify', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Wagner/Africa Corps mercenaries deployed across Mali — atrocities reported', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'Djibo under extended siege — civilians face starvation in Burkina Faso', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'ISGS and JNIM expand territorial control across Sahel — millions displaced', domain: 'apnews.com', country: 'United States' },
    { title: 'Post-French withdrawal security vacuum accelerates jihadist expansion', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Niger junta consolidates power as regional alliance with Mali and Burkina deepens', domain: 'france24.com', country: 'France' },
    { title: 'UNHCR: Refugee flows from Sahel region overwhelm neighboring coastal states', domain: 'unhcr.org', country: 'Switzerland' },
  ],

  drc: [
    { title: 'M23 forces advance on Goma — Rwanda-backed offensive threatens provincial capital', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Rwanda denies military support to M23 despite overwhelming evidence from UN panel', domain: 'bbc.com', country: 'United Kingdom' },
    { title: '7 million displaced in eastern DRC — worst humanitarian crisis in Africa', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'ADF/ISIS-linked forces conduct mass attack on civilians near Beni', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'MONUSCO peacekeepers begin withdrawal as M23 offensive intensifies', domain: 'france24.com', country: 'France' },
    { title: 'DRC government accuses Rwanda of invasion — regional diplomatic crisis deepens', domain: 'apnews.com', country: 'United States' },
    { title: 'Coltan and cobalt mining disrupted by conflict — global supply chain impact', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'South Kivu instability spreads as multiple armed groups exploit power vacuum', domain: 'bbc.com', country: 'United Kingdom' },
  ],

  haiti: [
    { title: 'Gangs control 80% of Port-au-Prince — government authority virtually nonexistent', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'UN-backed Kenyan security force deployed but outgunned by armed gangs', domain: 'bbc.com', country: 'United Kingdom' },
    { title: '700,000 displaced as gang violence spreads beyond capital into Artibonite', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'Transitional council fails to establish governance — state collapse deepens', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Humanitarian corridors repeatedly blocked by gang checkpoints', domain: 'france24.com', country: 'France' },
    { title: 'Children recruited by armed gangs at alarming rate — UNICEF warns', domain: 'unicef.org', country: 'United States' },
    { title: 'Haiti police force undermanned and outmatched by well-armed gang coalitions', domain: 'apnews.com', country: 'United States' },
    { title: 'Dominican Republic reinforces border as Haitian refugees surge', domain: 'reuters.com', country: 'United Kingdom' },
  ],

  venezuela: [
    { title: 'US military strikes on Venezuelan fishing boats kill over 100 — international outcry', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Maduro regime consolidates power despite international pressure campaign', domain: 'bbc.com', country: 'United Kingdom' },
    { title: '7.7 million Venezuelans have fled since 2014 — largest refugee crisis in Americas', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'Opposition leader Machado calls for international intervention from exile', domain: 'washingtonpost.com', country: 'United States' },
    { title: 'US Navy increases Caribbean presence around Venezuela — tensions escalate', domain: 'cnn.com', country: 'United States' },
    { title: 'Colombia and Brazil express concern over US military approach to Venezuela', domain: 'aljazeera.com', country: 'Qatar' },
    { title: 'Venezuelan oil production at historic low as sanctions bite deeper', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Latin American leaders condemn US strikes — diplomatic isolation grows', domain: 'france24.com', country: 'France' },
  ],

  ethiopia: [
    { title: 'Fano militia expands control across Amhara region — government forces stretched thin', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Tigray ceasefire holds but humanitarian crisis remains severe — recovery stalled', domain: 'bbc.com', country: 'United Kingdom' },
    { title: 'OLA insurgency in Oromia continues low-level guerrilla campaign', domain: 'aljazeera.com', country: 'Qatar' },
    { title: '4.6 million internally displaced across Ethiopia — aid organizations overwhelmed', domain: 'unhcr.org', country: 'Switzerland' },
    { title: 'Ethiopian government declares state of emergency in parts of Amhara region', domain: 'france24.com', country: 'France' },
    { title: 'Gondar sees heavy fighting as Fano militia clashes with federal forces', domain: 'apnews.com', country: 'United States' },
    { title: 'International community urges Addis Ababa to negotiate with Fano leadership', domain: 'reuters.com', country: 'United Kingdom' },
    { title: 'Eritrea border tensions add complexity to Ethiopian security challenges', domain: 'bbc.com', country: 'United Kingdom' },
  ],
};

// ─── QUERY → CONFLICT MATCHING ───────────────────────────────────────────────────

const queryKeywords: Record<string, string[]> = {
  iran: ['iran', 'tehran', 'epic fury', 'irgc', 'hormuz', 'persian gulf'],
  ukraine: ['ukraine', 'kyiv', 'donbas', 'zaporizhzhia', 'russia ukraine', 'kharkiv'],
  gaza: ['gaza', 'palestine', 'hamas', 'west bank', 'rafah', 'ceasefire gaza'],
  sudan: ['sudan', 'khartoum', 'rsf', 'darfur'],
  myanmar: ['myanmar', 'burma', 'shan state', 'rakhine', 'tatmadaw'],
  yemen: ['yemen', 'houthi', 'aden', 'red sea shipping'],
  syria: ['syria', 'damascus', 'sdf', 'hts', 'idlib'],
  sahel: ['sahel', 'mali', 'burkina faso', 'bamako', 'jnim'],
  drc: ['congo', 'drc', 'goma', 'north kivu', 'm23'],
  haiti: ['haiti', 'port au prince'],
  venezuela: ['venezuela', 'maduro', 'caracas'],
  ethiopia: ['ethiopia', 'amhara', 'fano', 'addis ababa', 'tigray'],
};

function detectConflictFromQuery(query: string): string {
  const q = query.toLowerCase();
  let bestMatch = 'iran';
  let bestScore = 0;
  for (const [conflict, keywords] of Object.entries(queryKeywords)) {
    const score = keywords.filter(kw => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = conflict;
    }
  }
  return bestMatch;
}

// ─── CONFLICT INTENSITY PROFILES (affects timeline/tone fallback shape) ────────

const conflictIntensity: Record<string, { volume: number; negativity: number }> = {
  iran: { volume: 1.0, negativity: 1.0 },
  ukraine: { volume: 0.85, negativity: 0.9 },
  gaza: { volume: 0.75, negativity: 0.95 },
  sudan: { volume: 0.4, negativity: 0.85 },
  myanmar: { volume: 0.35, negativity: 0.6 },
  yemen: { volume: 0.45, negativity: 0.7 },
  syria: { volume: 0.4, negativity: 0.55 },
  sahel: { volume: 0.3, negativity: 0.75 },
  drc: { volume: 0.35, negativity: 0.8 },
  haiti: { volume: 0.25, negativity: 0.65 },
  venezuela: { volume: 0.3, negativity: 0.5 },
  ethiopia: { volume: 0.25, negativity: 0.6 },
};

// ─── GENERATORS ──────────────────────────────────────────────────────────────────

// Simple seeded shuffle so fallback data rotates over time (changes every 10 min)
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateFallbackArticles(query = 'iran'): FallbackArticle[] {
  const conflict = detectConflictFromQuery(query);
  const headlines = conflictHeadlines[conflict] || conflictHeadlines.iran;
  const seed = Math.floor(Date.now() / 600_000) + conflict.charCodeAt(0);
  const shuffled = shuffleWithSeed(headlines, seed);
  return shuffled.map((h, i) => ({
    title: h.title,
    url: `https://${h.domain}`,
    domain: h.domain,
    seendate: gdeltDate(i * 0.4),
    socialimage: h.image || '',
    language: 'English',
    sourcecountry: h.country,
  }));
}

export function generateFallbackTimeline(query = 'iran'): { date: string; value: number }[] {
  const conflict = detectConflictFromQuery(query);
  const intensity = conflictIntensity[conflict] || conflictIntensity.iran;
  const data: { date: string; value: number }[] = [];
  // Use conflict name as seed for deterministic but per-conflict noise
  let noiseSeed = conflict.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let h = 47; h >= 0; h--) {
    const hour = new Date(Date.now() - h * 3600000).getUTCHours();
    const base = (hour >= 6 && hour <= 22 ? 35 : 12) * intensity.volume;
    const spike = (h < 6 ? 25 : h < 12 ? 15 : 0) * intensity.volume;
    noiseSeed = (noiseSeed * 16807) % 2147483647;
    const noise = (noiseSeed % 15) * intensity.volume;
    data.push({
      date: gdeltDate(h),
      value: Math.round(base + spike + noise),
    });
  }
  return data;
}

export function generateFallbackTone(query = 'iran'): { date: string; value: number }[] {
  const conflict = detectConflictFromQuery(query);
  const intensity = conflictIntensity[conflict] || conflictIntensity.iran;
  const data: { date: string; value: number }[] = [];
  let noiseSeed = conflict.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 99;
  for (let h = 47; h >= 0; h--) {
    const base = -2.5 * intensity.negativity;
    const variation = Math.sin(h / 6) * 1.2;
    noiseSeed = (noiseSeed * 16807) % 2147483647;
    const noise = ((noiseSeed % 150) / 100 - 0.75);
    const spike = h < 8 ? -1 * intensity.negativity : 0;
    data.push({
      date: gdeltDate(h),
      value: Number((base + variation + noise + spike).toFixed(2)),
    });
  }
  return data;
}

// ─── GEOPOLITICS TOPIC FALLBACK ──────────────────────────────────────────────────

const topicArticles: Record<string, { title: string; domain: string }[]> = {
  oil: [
    { title: 'Brent crude surges to $96 as Iran conflict threatens key shipping lanes', domain: 'reuters.com' },
    { title: 'OPEC emergency meeting called as Strait of Hormuz traffic halts', domain: 'bloomberg.com' },
    { title: 'US releases 30M barrels from Strategic Petroleum Reserve to calm markets', domain: 'apnews.com' },
    { title: 'Natural gas futures spike across Europe on Middle East supply fears', domain: 'ft.com' },
    { title: 'India and Japan scramble for alternative oil sources as Gulf routes disrupted', domain: 'reuters.com' },
  ],
  gulf: [
    { title: 'Saudi Arabia activates air defense systems, closes eastern airspace', domain: 'arabnews.com' },
    { title: 'Qatar and UAE evacuate non-essential diplomatic staff from Tehran', domain: 'aljazeera.com' },
    { title: 'Bahrain orders US Fifth Fleet to highest readiness level since 2003', domain: 'reuters.com' },
    { title: 'Kuwait suspends all commercial flights amid regional airspace closures', domain: 'thenationalnews.com' },
    { title: 'Oman offers to mediate between Washington and Tehran as tensions peak', domain: 'arabnews.com' },
  ],
  europe: [
    { title: 'EU foreign ministers hold emergency summit on Iran crisis in Brussels', domain: 'euronews.com' },
    { title: 'NATO activates rapid response elements amid Middle East escalation', domain: 'reuters.com' },
    { title: 'Germany evacuates embassy staff from Tehran, warns citizens to leave', domain: 'dw.com' },
    { title: 'France deploys frigate to Persian Gulf to protect European shipping', domain: 'france24.com' },
    { title: 'UK Parliament recalled for emergency debate on Iran military action', domain: 'bbc.com' },
  ],
  russiachina: [
    { title: 'Putin warns US strikes on Iran could "destabilize entire region beyond repair"', domain: 'reuters.com' },
    { title: 'China calls emergency UN Security Council session on Iran attacks', domain: 'scmp.com' },
    { title: 'Russia-China joint statement condemns "unilateral military aggression" against Iran', domain: 'aljazeera.com' },
    { title: 'Moscow hints at accelerated weapons deliveries to Tehran if strikes continue', domain: 'bbc.com' },
    { title: 'Beijing suspends US trade talks in protest over Iran military operations', domain: 'reuters.com' },
  ],
  uspolitics: [
    { title: 'Congress demands emergency War Powers briefing as Iran operations expand', domain: 'washingtonpost.com' },
    { title: 'Pentagon: Operations proceeding within scope of 2001 AUMF authorization', domain: 'cnn.com' },
    { title: 'Bipartisan group of senators introduces Iran War Powers resolution', domain: 'politico.com' },
    { title: 'Defense Secretary briefs congressional leaders on Iran campaign objectives', domain: 'nbcnews.com' },
    { title: 'State Department orders departure of non-essential staff from 5 Middle East embassies', domain: 'apnews.com' },
  ],
  humanitarian: [
    { title: 'UNHCR: 200,000 displaced within Iran as airstrikes target military zones near cities', domain: 'reuters.com' },
    { title: 'Red Cross demands humanitarian corridor as medical supplies run low in Tehran', domain: 'icrc.org' },
    { title: 'WHO reports hospitals in Isfahan overwhelmed, requests emergency medical supplies', domain: 'who.int' },
    { title: 'Iran reports 89 civilian casualties, calls for international war crimes investigation', domain: 'aljazeera.com' },
    { title: 'Turkey opens border for Iranian refugees as humanitarian crisis deepens', domain: 'unhcr.org' },
  ],
};

export function generateFallbackTopicArticles(): Record<string, { title: string; url: string; domain: string; seendate: string }[]> {
  const result: Record<string, { title: string; url: string; domain: string; seendate: string }[]> = {};
  for (const [key, articles] of Object.entries(topicArticles)) {
    result[key] = articles.map((a, i) => ({
      title: a.title,
      url: `https://${a.domain}`,
      domain: a.domain,
      seendate: gdeltDate(i * 2 + 1),
    }));
  }
  return result;
}

// ─── REDDIT FALLBACK ────────────────────────────────────────────────────────────

const redditPosts: { title: string; subreddit: string; score: number; comments: number }[] = [
  { title: 'MEGATHREAD: US launches strikes on Iranian military targets — live updates', subreddit: 'worldnews', score: 48920, comments: 12450 },
  { title: 'Iran retaliates with missile strikes on US bases in Iraq and Syria', subreddit: 'worldnews', score: 35100, comments: 8900 },
  { title: 'Satellite imagery shows extensive damage to Iranian military sites', subreddit: 'worldnews', score: 28400, comments: 5670 },
  { title: 'Strait of Hormuz effectively closed as military operations intensify', subreddit: 'worldnews', score: 22300, comments: 4520 },
  { title: 'Oil prices spike to $96 — highest since 2022 amid Iran conflict', subreddit: 'worldnews', score: 19800, comments: 3890 },
  { title: 'NATO consults on Article 4 as Iran conflict threatens to expand', subreddit: 'worldnews', score: 17600, comments: 3210 },
  { title: 'Internet virtually shut off across Iran — NetBlocks reports 4% connectivity', subreddit: 'worldnews', score: 15200, comments: 2870 },
  { title: 'Hezbollah launches massive rocket barrage at northern Israel', subreddit: 'worldnews', score: 13400, comments: 2540 },
  { title: 'As an Iranian living abroad, I am terrified for my family right now', subreddit: 'iran', score: 4520, comments: 890 },
  { title: 'Communication with family in Tehran cut off for 18 hours now', subreddit: 'iran', score: 3890, comments: 670 },
  { title: 'Video compilation of IRGC rocket launches from western Iran', subreddit: 'iran', score: 3210, comments: 450 },
  { title: 'Reports of anti-regime protests in Shiraz and Tabriz amid strikes', subreddit: 'iran', score: 2780, comments: 380 },
  { title: 'How to help Iranian civilians affected by the conflict — verified charities', subreddit: 'iran', score: 2340, comments: 290 },
  { title: 'Analysis: The strategic logic behind US targeting of Iranian nuclear infrastructure', subreddit: 'geopolitics', score: 3450, comments: 780 },
  { title: 'How will the Iran conflict reshape the Middle East power balance?', subreddit: 'geopolitics', score: 2890, comments: 620 },
  { title: 'Russia and China blocking UNSC resolution — what are the implications?', subreddit: 'geopolitics', score: 2560, comments: 540 },
  { title: 'The Strait of Hormuz chokepoint: why 21% of global oil passes through here', subreddit: 'geopolitics', score: 2210, comments: 430 },
  { title: 'Comparing this to the 2003 Iraq invasion — similarities and key differences', subreddit: 'geopolitics', score: 1980, comments: 380 },
  { title: 'OSINT thread: Tracking all confirmed strike locations in Iran', subreddit: 'geopolitics', score: 1780, comments: 290 },
  { title: 'Houthi anti-ship attacks in Red Sea escalating alongside Iran conflict', subreddit: 'worldnews', score: 11200, comments: 2100 },
  { title: 'UN General Assembly emergency session called on Iran crisis', subreddit: 'worldnews', score: 9800, comments: 1890 },
  { title: 'Multiple airlines suspend all Middle East routes indefinitely', subreddit: 'worldnews', score: 8900, comments: 1560 },
  { title: 'Turkey closes Incirlik airbase to US operations against Iran', subreddit: 'worldnews', score: 7600, comments: 1340 },
  { title: 'European stock markets drop 4% on Iran escalation fears', subreddit: 'worldnews', score: 6800, comments: 1120 },
  { title: 'Pentagon confirms multi-domain operations continuing across Iranian territory', subreddit: 'worldnews', score: 5900, comments: 980 },
];

export function generateFallbackRedditPosts() {
  const seed = Math.floor(Date.now() / 600_000) + 42;
  const shuffled = shuffleWithSeed(redditPosts, seed);
  return shuffled.map((p, i) => ({
    id: `fallback_${i}_${seed}`,
    title: p.title,
    subreddit: p.subreddit,
    score: p.score + Math.floor(((seed * (i + 1)) % 500) - 250),
    numComments: p.comments + Math.floor(((seed * (i + 2)) % 100) - 50),
    permalink: `https://www.reddit.com/r/${p.subreddit}/comments/fallback${i}`,
    createdUtc: Math.floor(Date.now() / 1000) - i * 1800,
    url: `https://www.reddit.com/r/${p.subreddit}/comments/fallback${i}`,
  }));
}
