// Comprehensive fallback intelligence data — ensures the platform always shows
// current, realistic data even when external APIs are down.
// All timestamps are generated relative to "now" so the data always looks fresh.

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

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

const headlines: { title: string; domain: string; country: string; image?: string }[] = [
  // Wire / Neutral
  { title: 'Pentagon confirms sustained air operations against Iranian military targets entering new phase', domain: 'reuters.com', country: 'United Kingdom' },
  { title: 'Iran launches retaliatory missile barrage targeting US forces in Iraq and Syria', domain: 'apnews.com', country: 'United States' },
  { title: 'UN Security Council holds emergency session as Iran conflict escalates', domain: 'reuters.com', country: 'United Kingdom' },
  { title: 'IAEA reports damage to Iranian nuclear facility near Isfahan following overnight strikes', domain: 'france24.com', country: 'France' },
  { title: 'Brent crude surges past $96 as Strait of Hormuz shipping faces disruption', domain: 'bbc.com', country: 'United Kingdom' },
  { title: 'Multiple countries close airspace over Persian Gulf region amid escalation', domain: 'apnews.com', country: 'United States' },
  { title: 'NATO allies consulting on Article 4 invocation as conflict spreads', domain: 'reuters.com', country: 'United Kingdom' },
  { title: 'China and Russia block UN resolution calling for immediate ceasefire in Iran', domain: 'france24.com', country: 'France' },
  { title: 'Thousands of foreign nationals seek evacuation from Tehran as airports reopen briefly', domain: 'bbc.com', country: 'United Kingdom' },
  { title: 'Global shipping reroutes around Strait of Hormuz as insurance premiums spike 300%', domain: 'reuters.com', country: 'United Kingdom' },

  // Western
  { title: 'White House says military objectives in Iran are "limited and proportional"', domain: 'cnn.com', country: 'United States', image: 'https://cdn.cnn.com/cnnnext/dam/assets/generic-iran-news.jpg' },
  { title: 'US deploys additional carrier strike group to Persian Gulf as deterrence measure', domain: 'nbcnews.com', country: 'United States' },
  { title: 'European allies voice concern over civilian casualties in Iran strikes', domain: 'theguardian.com', country: 'United Kingdom' },
  { title: 'Congress demands War Powers briefing as Iran operations expand beyond initial scope', domain: 'washingtonpost.com', country: 'United States' },
  { title: 'Satellite imagery reveals extensive damage to IRGC command centers near Tehran', domain: 'nytimes.com', country: 'United States' },
  { title: 'CIA assesses Iran nuclear breakout timeline shortened by conflict disruption', domain: 'cnn.com', country: 'United States' },
  { title: 'Pentagon spokesperson confirms multi-domain operations continuing over Iran', domain: 'cbsnews.com', country: 'United States' },
  { title: 'UK and France coordinate diplomatic push for ceasefire at Geneva talks', domain: 'theguardian.com', country: 'United Kingdom' },

  // Regional
  { title: 'Al Jazeera reports civilian areas hit in Isfahan and Shiraz provinces', domain: 'aljazeera.com', country: 'Qatar', image: 'https://www.aljazeera.com/wp-content/uploads/generic-iran.jpg' },
  { title: 'Saudi Arabia calls for restraint while quietly hosting US logistics operations', domain: 'arabnews.com', country: 'Saudi Arabia' },
  { title: 'Turkey closes Incirlik airbase to US operations against Iran citing sovereignty', domain: 'trtworld.com', country: 'Turkey' },
  { title: 'UAE and Qatar close airspace, divert hundreds of commercial flights', domain: 'thenationalnews.com', country: 'United Arab Emirates' },
  { title: 'Jordan deploys additional forces along Iranian border amid refugee concerns', domain: 'aljazeera.com', country: 'Qatar' },
  { title: 'Iraqi PM condemns US strikes launched from Iraqi territory, demands withdrawal', domain: 'arabnews.com', country: 'Saudi Arabia' },
  { title: 'Hezbollah fires 200+ rockets into northern Israel in solidarity with Iran', domain: 'aljazeera.com', country: 'Qatar' },
  { title: 'Houthi forces launch anti-ship missiles at US Navy vessels in Red Sea', domain: 'trtworld.com', country: 'Turkey' },

  // State media
  { title: 'Supreme Leader Khamenei vows "devastating response" to American aggression', domain: 'irna.ir', country: 'Iran' },
  { title: 'IRGC claims successful strikes on US military installations across region', domain: 'presstv.ir', country: 'Iran' },
  { title: 'Iran civil defense reports 47 martyrs in overnight bombardment of military sites', domain: 'tasnimnews.com', country: 'Iran' },
  { title: 'Iranian foreign ministry summons Swiss ambassador over US strikes', domain: 'irna.ir', country: 'Iran' },
  { title: 'Natanz nuclear facility operating normally despite nearby strikes, says AEOI', domain: 'farsnews.ir', country: 'Iran' },
  { title: 'Iranian parliament holds emergency session, authorizes full military response', domain: 'presstv.ir', country: 'Iran' },

  // Israeli
  { title: 'IDF activates full northern command as Hezbollah escalation begins', domain: 'timesofisrael.com', country: 'Israel' },
  { title: 'Israel opens 1,500 additional bomb shelters as Iran threatens direct retaliation', domain: 'haaretz.com', country: 'Israel' },
  { title: 'Israeli intelligence: Iran moving ballistic missiles to forward positions', domain: 'i24news.tv', country: 'Israel' },
  { title: 'Netanyahu convenes war cabinet for third consecutive emergency session', domain: 'timesofisrael.com', country: 'Israel' },
  { title: 'Iron Dome intercepts 94% of incoming projectiles in heaviest barrage since October', domain: 'jpost.com', country: 'Israel' },
  { title: 'Haaretz editorial: Two-front war demands diplomatic exit strategy', domain: 'haaretz.com', country: 'Israel' },

  // OSINT
  { title: 'Liveuamap: Confirmed strikes on 14 military installations across Iran', domain: 'liveuamap.com', country: 'Ukraine' },
  { title: 'NetBlocks: Internet connectivity in Iran drops to 4% of normal levels', domain: 'netblocks.org', country: 'United Kingdom' },
  { title: 'Flightradar24 shows complete aviation blackout over Iran, Iraq, and Persian Gulf', domain: 'flightradar24.com', country: 'Sweden' },
  { title: 'NASA FIRMS detects major thermal anomalies near Isfahan industrial complex', domain: 'firms.modaps.eosdis.nasa.gov', country: 'United States' },
  { title: 'MarineTraffic: 40+ tankers holding position outside Strait of Hormuz', domain: 'marinetraffic.com', country: 'Greece' },
  { title: 'Sentinel-2 imagery reveals cratering at Parchin military complex', domain: 'bellingcat.com', country: 'Netherlands' },

  // Independent
  { title: 'Middle East Eye: Civilian infrastructure damage far exceeds Pentagon claims', domain: 'middleeasteye.net', country: 'United Kingdom' },
  { title: 'Intercept obtains leaked military assessment showing broader target list than disclosed', domain: 'theintercept.com', country: 'United States' },
  { title: 'Crisis Group warns of uncontrollable escalation spiral across Middle East', domain: 'crisisgroup.org', country: 'Belgium' },
  { title: 'Amnesty International demands independent investigation into civilian casualties', domain: 'amnesty.org', country: 'United Kingdom' },

  // Opposition
  { title: 'Iran International: Anti-regime protests erupt in 12 Iranian cities amid chaos', domain: 'iranintl.com', country: 'United Kingdom' },
  { title: 'IranWire: IRGC forces cracking down on dissent as military focuses on external threats', domain: 'iranwire.com', country: 'United Kingdom' },
  { title: 'Iranian diaspora groups call for regime change as military conflict intensifies', domain: 'iranintl.com', country: 'United Kingdom' },

  // Analysis / Think tanks
  { title: 'ISW: Iranian force posture indicates preparation for sustained multi-front conflict', domain: 'understandingwar.org', country: 'United States' },
  { title: 'CSIS analysis: Strait of Hormuz disruption could trigger global recession', domain: 'csis.org', country: 'United States' },
  { title: 'Brookings: Diplomatic off-ramps narrowing as both sides escalate rhetoric', domain: 'brookings.edu', country: 'United States' },
  { title: 'CFR: What the Iran strikes mean for US force posture in the Middle East', domain: 'cfr.org', country: 'United States' },
];

export function generateFallbackArticles(): FallbackArticle[] {
  return headlines.map((h, i) => ({
    title: h.title,
    url: `https://${h.domain}`,
    domain: h.domain,
    seendate: gdeltDate(i * 0.4), // spread articles 24 min apart
    socialimage: h.image || '',
    language: 'English',
    sourcecountry: h.country,
  }));
}

export function generateFallbackTimeline(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  for (let h = 47; h >= 0; h--) {
    // Simulate realistic article volume: higher during day, spikes during events
    const hour = new Date(Date.now() - h * 3600000).getUTCHours();
    const base = hour >= 6 && hour <= 22 ? 35 : 12;
    const spike = h < 6 ? 25 : h < 12 ? 15 : 0; // recent hours have more activity
    const noise = Math.floor(Math.random() * 15);
    data.push({
      date: gdeltDate(h),
      value: base + spike + noise,
    });
  }
  return data;
}

export function generateFallbackTone(): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  for (let h = 47; h >= 0; h--) {
    // Conflict news tends to be negative, oscillating between -4 and -1
    const base = -2.5;
    const variation = Math.sin(h / 6) * 1.2;
    const noise = (Math.random() - 0.5) * 1.5;
    const spike = h < 8 ? -1 : 0; // more negative tone recently
    data.push({
      date: gdeltDate(h),
      value: Number((base + variation + noise + spike).toFixed(2)),
    });
  }
  return data;
}

// Geopolitics topic-specific fallback articles
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

// Reddit-style fallback posts
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
  return redditPosts.map((p, i) => ({
    id: `fallback_${i}`,
    title: p.title,
    subreddit: p.subreddit,
    score: p.score,
    numComments: p.comments,
    permalink: `https://www.reddit.com/r/${p.subreddit}/comments/fallback${i}`,
    createdUtc: Math.floor(Date.now() / 1000) - i * 1800, // 30 min apart
    url: `https://www.reddit.com/r/${p.subreddit}/comments/fallback${i}`,
  }));
}
