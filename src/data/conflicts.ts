// Master conflict configuration — drives the entire Command Center.
// Each conflict has its own GDELT queries, map coordinates, key locations,
// situation status, timeline, and metadata.

export type ConflictId = 'iran' | 'ukraine' | 'gaza' | 'sudan' | 'myanmar' | 'yemen' | 'syria' | 'sahel' | 'drc' | 'haiti' | 'venezuela' | 'ethiopia';

export type StatusColor = 'red' | 'amber' | 'green' | 'gray';

export interface KeyLocation {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface TimelineEvent {
  date: string;
  label: string;
  detail: string;
  isCritical: boolean;
}

export interface Theater {
  name: string;
  status: 'ACTIVE' | 'TENSE' | 'MONITORING';
  lastEvent: string;
  assessment: string;
}

export interface WatchlistItem {
  label: string;
  status: 'alert' | 'warn' | 'stable';
  detail: string;
}

export interface ConflictConfig {
  id: ConflictId;
  name: string;
  subtitle: string;
  region: string;
  status: string;
  statusColor: StatusColor;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WATCH';
  startDate: string;
  gdeltQuery: string;
  gdeltGeoQuery: string;
  redditSubs: string[];
  mapCenter: [number, number];
  mapZoom: number;
  keyLocations: KeyLocation[];
  situationStatus: Record<string, { value: string; color: StatusColor }>;
  theaters: Theater[];
  watchlist: WatchlistItem[];
  timelineEvents: TimelineEvent[];
  casualtyEstimate?: string;
  displacedEstimate?: string;
}

// ─── IRAN ───────────────────────────────────────────────────────────────────────

const iran: ConflictConfig = {
  id: 'iran',
  name: 'Iran Conflict',
  subtitle: 'Operation Epic Fury — U.S. & Israel Strikes on Iran',
  region: 'Middle East',
  status: 'ACTIVE COMBAT',
  statusColor: 'red',
  severity: 'CRITICAL',
  startDate: '2026-02-28',
  gdeltQuery: 'iran attack OR iran strike OR tehran OR operation epic fury OR iran war OR iran missile',
  gdeltGeoQuery: 'iran',
  redditSubs: ['worldnews', 'iran', 'geopolitics', 'OSINT'],
  mapCenter: [32.43, 53.69],
  mapZoom: 5,
  keyLocations: [
    { name: 'Tehran', lat: 35.6892, lng: 51.389, description: 'Capital — Strikes on leadership targets, Khamenei compound targeted' },
    { name: 'Isfahan', lat: 32.6546, lng: 51.668, description: 'Nuclear facilities — Natanz enrichment plant nearby, strikes confirmed' },
    { name: 'Qom', lat: 34.6399, lng: 50.876, description: 'Religious center — Explosions reported' },
    { name: 'Tabriz', lat: 38.08, lng: 46.292, description: 'Northwestern Iran — Military installations struck' },
    { name: 'Karaj', lat: 35.84, lng: 50.939, description: 'Near Tehran — Industrial/military targets' },
    { name: 'Kermanshah', lat: 34.3142, lng: 47.065, description: 'Western Iran — IRGC missile bases' },
    { name: 'Yazd', lat: 31.8974, lng: 54.357, description: 'Central Iran — Military targets' },
    { name: 'Bandar Abbas', lat: 27.1865, lng: 56.2808, description: 'Naval base — Iranian Navy HQ, Strait of Hormuz' },
    { name: 'Bushehr', lat: 28.9684, lng: 50.8385, description: 'Nuclear power plant region' },
    { name: 'Parchin', lat: 35.52, lng: 51.77, description: 'Military complex — Suspected weapons research' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE COMBAT', color: 'red' },
    'U.S. Operation': { value: 'Epic Fury', color: 'red' },
    'Israel Operation': { value: 'Roar of the Lion / Shield of Judah', color: 'red' },
    'Iran Internet': { value: '~4% — Near Total Blackout', color: 'red' },
    'Iran Airspace': { value: 'CLOSED', color: 'red' },
    'Israel Status': { value: 'STATE OF EMERGENCY', color: 'red' },
    'Gulf Airspace': { value: 'QA/BH/KW/AE RESTRICTED', color: 'red' },
    'Iran Retaliation': { value: 'Missiles toward Israel, UAE, Bahrain, Qatar', color: 'red' },
    'U.S. Base (Bahrain)': { value: 'TARGETED — 5th Fleet HQ hit', color: 'red' },
    'UAE Casualties': { value: '1 confirmed fatality from Iranian missile', color: 'red' },
    'Duration Estimate': { value: 'Multi-day campaign planned', color: 'amber' },
    'Nuclear Targets': { value: 'Enrichment facilities in strike packages', color: 'red' },
  },
  theaters: [
    { name: 'Iran (Primary)', status: 'ACTIVE', lastEvent: 'Ongoing airstrikes on 14+ military installations', assessment: 'Multi-domain operations continuing. Air defense suppression phase.' },
    { name: 'Israel / Lebanon', status: 'ACTIVE', lastEvent: 'Hezbollah fires 200+ rockets into northern Israel', assessment: 'IDF northern command fully activated. Two-front conflict.' },
    { name: 'Iraq / Syria', status: 'ACTIVE', lastEvent: 'IRGC missile strikes on US bases', assessment: 'US forces under direct fire. Force protection elevated.' },
    { name: 'Yemen / Red Sea', status: 'TENSE', lastEvent: 'Houthi anti-ship missiles at USN vessels', assessment: 'Shipping lane interdiction ongoing. Insurance premiums spiking.' },
    { name: 'Persian Gulf / Hormuz', status: 'ACTIVE', lastEvent: 'Strait effectively closed to commercial traffic', assessment: '40+ tankers holding position. Oil supply chain disrupted.' },
    { name: 'Cyber Domain', status: 'TENSE', lastEvent: 'Iran internet at 4% — suspected state kill-switch', assessment: 'Attribution pending on infrastructure attacks.' },
  ],
  watchlist: [
    { label: 'Strait of Hormuz', status: 'alert', detail: 'Effectively closed — 40+ tankers holding' },
    { label: 'Natanz Nuclear Site', status: 'alert', detail: 'Under strike — IAEA reports damage' },
    { label: 'Hezbollah / N. Israel', status: 'alert', detail: '200+ rockets fired — IDF responding' },
    { label: 'Red Sea / Houthis', status: 'warn', detail: 'Anti-ship missiles at USN vessels' },
    { label: 'Iran Internet', status: 'alert', detail: '4% connectivity — near-total blackout' },
    { label: 'US Bases Iraq/Syria', status: 'alert', detail: 'Under IRGC missile attack' },
    { label: 'Oil Markets', status: 'warn', detail: 'Brent $96+ — SPR release underway' },
    { label: 'Russia / China Posture', status: 'warn', detail: 'Blocking UNSC — rhetoric escalating' },
  ],
  timelineEvents: [
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
  ],
  casualtyEstimate: '89+ reported (Iran claims)',
  displacedEstimate: '200,000+ within Iran',
};

// ─── UKRAINE ────────────────────────────────────────────────────────────────────

const ukraine: ConflictConfig = {
  id: 'ukraine',
  name: 'Russia-Ukraine War',
  subtitle: 'Full-Scale Invasion — Day 1,465+',
  region: 'Eastern Europe',
  status: 'ACTIVE COMBAT',
  statusColor: 'red',
  severity: 'CRITICAL',
  startDate: '2022-02-24',
  gdeltQuery: 'ukraine war OR russia ukraine OR kyiv attack OR donbas OR zaporizhzhia strike',
  gdeltGeoQuery: 'ukraine OR russia',
  redditSubs: ['ukraine', 'worldnews', 'UkrainianConflict', 'CombatFootage'],
  mapCenter: [48.5, 36.0],
  mapZoom: 6,
  keyLocations: [
    { name: 'Kyiv', lat: 50.4501, lng: 30.5234, description: 'Capital — Regular drone/missile strikes on energy infrastructure' },
    { name: 'Kharkiv', lat: 49.9935, lng: 36.2304, description: '2nd city — Under constant bombardment' },
    { name: 'Kramatorsk', lat: 48.7376, lng: 37.5937, description: 'Ukrainian-held Donetsk — Key Russian objective' },
    { name: 'Pokrovsk', lat: 48.2833, lng: 37.1833, description: 'Donetsk — Active frontline, Russian advances' },
    { name: 'Zaporizhzhia', lat: 47.8388, lng: 35.1396, description: 'Southern front — Nuclear plant concerns' },
    { name: 'Odesa', lat: 46.4825, lng: 30.7233, description: 'Port city — Strikes on port infrastructure' },
    { name: 'Avdiivka', lat: 48.1394, lng: 37.7408, description: 'Fallen to Russia Feb 2024 — Now Russian staging area' },
    { name: 'Belgorod', lat: 50.5997, lng: 36.5882, description: 'Russia — Ukrainian strikes on energy' },
    { name: 'Luhansk', lat: 48.574, lng: 39.3078, description: 'Russian-occupied — Ukrainian strikes on oil depot' },
    { name: 'Kursk', lat: 51.7373, lng: 36.1874, description: 'Russia — Ukraine lost foothold spring 2025' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE — Year 5', color: 'red' },
    'Russian Territory Control': { value: '~20% of Ukraine (incl. Crimea)', color: 'red' },
    'Recent Russian Gains': { value: '182 sq mi (Jan 13 - Feb 10)', color: 'amber' },
    'Frontline Status': { value: 'Largely static, grinding attrition', color: 'amber' },
    'Energy Infrastructure': { value: 'Ukraine: 80% thermal capacity lost', color: 'red' },
    'Russian Casualties (est.)': { value: '~1.1M killed/wounded', color: 'red' },
    'Ukrainian Casualties (est.)': { value: '~500-600K killed/wounded', color: 'red' },
    'Diplomacy': { value: 'US-Ukraine-Russia talks in Geneva', color: 'amber' },
    'Latest Strike': { value: '420 drones + 39 missiles overnight Feb 25-26', color: 'red' },
    'Starlink': { value: 'Russian access being shut off', color: 'green' },
  },
  theaters: [
    { name: 'Donetsk Front', status: 'ACTIVE', lastEvent: 'Russian advances toward Pokrovsk continue', assessment: 'Main axis of Russian offensive. Grinding attrition warfare.' },
    { name: 'Kharkiv Oblast', status: 'ACTIVE', lastEvent: 'FPV drone warfare intensifying', assessment: 'City under constant bombardment. Defensive lines holding.' },
    { name: 'Zaporizhzhia', status: 'TENSE', lastEvent: 'Nuclear plant ceasefire for repairs', assessment: 'Southern front relatively quiet. Nuclear concerns persist.' },
    { name: 'Black Sea / Odesa', status: 'TENSE', lastEvent: 'Port infrastructure strikes', assessment: 'Grain exports affected. Russian Black Sea Fleet diminished.' },
    { name: 'Russian Territory', status: 'ACTIVE', lastEvent: 'Ukrainian strikes on Belgorod energy', assessment: 'Ukraine striking deep into Russia. Kursk foothold lost.' },
    { name: 'Cyber / Info War', status: 'ACTIVE', lastEvent: 'Starlink access cut for Russian forces', assessment: 'Ongoing information warfare on both sides.' },
  ],
  watchlist: [
    { label: 'Pokrovsk Axis', status: 'alert', detail: 'Russian advances continuing' },
    { label: 'Zaporizhzhia NPP', status: 'warn', detail: 'Ceasefire for repairs — fragile' },
    { label: 'Energy Grid', status: 'alert', detail: '80% thermal capacity destroyed' },
    { label: 'Geneva Talks', status: 'warn', detail: 'US-Ukraine-Russia negotiations' },
    { label: 'Russian Casualties', status: 'alert', detail: '1.1M+ cumulative' },
    { label: 'Drone Warfare', status: 'alert', detail: 'FPV drones now primary weapon' },
  ],
  timelineEvents: [
    { date: 'Feb 2022', label: 'Full-scale invasion', detail: 'Russia launches invasion from multiple axes', isCritical: true },
    { date: 'Sep 2022', label: 'Kharkiv counteroffensive', detail: 'Ukraine liberates Kharkiv oblast', isCritical: true },
    { date: 'Nov 2022', label: 'Kherson liberated', detail: 'Russia retreats across Dnipro river', isCritical: true },
    { date: 'Jun 2023', label: 'Counteroffensive begins', detail: 'Ukrainian southern push — limited gains', isCritical: false },
    { date: 'Feb 2024', label: 'Avdiivka falls', detail: 'Russia captures Avdiivka after months of fighting', isCritical: true },
    { date: 'Aug 2024', label: 'Kursk incursion', detail: 'Ukraine seizes territory in Kursk, Russia', isCritical: true },
    { date: 'Spring 2025', label: 'Kursk foothold lost', detail: 'Russia pushes Ukraine out of Kursk', isCritical: true },
    { date: 'Feb 2026', label: 'Massive drone/missile wave', detail: '420 drones + 39 missiles overnight', isCritical: true },
  ],
  casualtyEstimate: '~1.6M+ combined killed/wounded',
  displacedEstimate: '6.3M+ internally displaced',
};

// ─── GAZA ───────────────────────────────────────────────────────────────────────

const gaza: ConflictConfig = {
  id: 'gaza',
  name: 'Gaza Conflict',
  subtitle: 'Israel-Hamas War & Occupation',
  region: 'Middle East',
  status: 'OCCUPATION',
  statusColor: 'amber',
  severity: 'HIGH',
  startDate: '2023-10-07',
  gdeltQuery: 'gaza war OR israel palestine OR hamas OR west bank OR rafah OR ceasefire gaza',
  gdeltGeoQuery: 'gaza OR israel OR palestine',
  redditSubs: ['worldnews', 'Palestine', 'IsraelPalestine', 'geopolitics'],
  mapCenter: [31.4, 34.4],
  mapZoom: 9,
  keyLocations: [
    { name: 'Gaza City', lat: 31.5, lng: 34.47, description: 'Massive destruction, displacement camp' },
    { name: 'Rafah', lat: 31.2, lng: 34.25, description: 'Southern Gaza — Border with Egypt' },
    { name: 'Khan Younis', lat: 31.34, lng: 34.3, description: 'Southern Gaza — Heavy destruction' },
    { name: 'Jabalia', lat: 31.53, lng: 34.48, description: 'Northern Gaza — Refugee camp' },
    { name: 'Jerusalem', lat: 31.77, lng: 35.23, description: 'Contested capital' },
    { name: 'Jenin', lat: 32.46, lng: 35.3, description: 'West Bank — IDF raids, resistance' },
    { name: 'Nablus', lat: 32.22, lng: 35.25, description: 'West Bank — Settlement expansion' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'Fragile ceasefire since Oct 10 2025', color: 'amber' },
    'Deaths Since Oct 7 2023': { value: '72,027+ Palestinians killed', color: 'red' },
    'Injured': { value: '171,651+', color: 'red' },
    'Post-Ceasefire Deaths': { value: '576 killed since Oct 10 ceasefire', color: 'red' },
    'Displaced': { value: '1.9M (~entire population)', color: 'red' },
    'Infrastructure': { value: 'Near total destruction', color: 'red' },
    'West Bank': { value: 'Escalating raids, settlement expansion', color: 'amber' },
    'Aid Access': { value: 'Severely restricted', color: 'red' },
    'UN Status': { value: 'Labeled genocide by multiple bodies', color: 'red' },
  },
  theaters: [
    { name: 'Gaza Strip', status: 'TENSE', lastEvent: 'Fragile ceasefire — sporadic violations', assessment: 'Near total destruction. 1.9M displaced.' },
    { name: 'West Bank', status: 'ACTIVE', lastEvent: 'IDF raids in Jenin and Nablus', assessment: 'Settlement expansion accelerating. Resistance growing.' },
    { name: 'Jerusalem', status: 'TENSE', lastEvent: 'Al-Aqsa tensions', assessment: 'Settler provocations continuing.' },
    { name: 'Lebanon Border', status: 'MONITORING', lastEvent: 'Hezbollah ceasefire holding', assessment: 'Tensions could reignite with Iran escalation.' },
  ],
  watchlist: [
    { label: 'Ceasefire', status: 'warn', detail: 'Fragile — sporadic violations reported' },
    { label: 'Humanitarian Crisis', status: 'alert', detail: '1.9M displaced, aid blocked' },
    { label: 'West Bank Raids', status: 'alert', detail: 'Escalating IDF operations' },
    { label: 'ICJ Proceedings', status: 'warn', detail: 'Genocide case ongoing' },
    { label: 'Aid Delivery', status: 'alert', detail: 'Severely restricted access' },
  ],
  timelineEvents: [
    { date: 'Oct 7 2023', label: 'Hamas attack on Israel', detail: '1,200 killed, 250+ hostages taken', isCritical: true },
    { date: 'Oct 2023', label: 'Israeli ground invasion', detail: 'IDF enters northern Gaza', isCritical: true },
    { date: 'Jan 2024', label: 'ICJ genocide case filed', detail: 'South Africa files case at International Court', isCritical: false },
    { date: 'May 2024', label: 'Rafah operation', detail: 'IDF enters Rafah despite international outcry', isCritical: true },
    { date: 'Oct 2025', label: 'Ceasefire agreement', detail: 'Fragile ceasefire reached', isCritical: true },
    { date: 'Feb 2026', label: 'Ceasefire violations', detail: 'Sporadic fighting continues', isCritical: false },
  ],
  casualtyEstimate: '72,027+ Palestinians, 1,200+ Israelis',
  displacedEstimate: '1.9M (~entire Gaza population)',
};

// ─── SUDAN ──────────────────────────────────────────────────────────────────────

const sudan: ConflictConfig = {
  id: 'sudan',
  name: 'Sudan Civil War',
  subtitle: 'SAF vs Rapid Support Forces',
  region: 'East Africa',
  status: 'CIVIL WAR',
  statusColor: 'red',
  severity: 'HIGH',
  startDate: '2023-04-15',
  gdeltQuery: 'sudan war OR khartoum fighting OR RSF sudan OR darfur famine OR sudan civil war',
  gdeltGeoQuery: 'sudan',
  redditSubs: ['worldnews', 'Sudan', 'geopolitics'],
  mapCenter: [15.5, 32.5],
  mapZoom: 5,
  keyLocations: [
    { name: 'Khartoum', lat: 15.5007, lng: 32.5599, description: 'Capital — Contested, heavy fighting' },
    { name: 'El Fasher', lat: 13.6285, lng: 25.3493, description: 'North Darfur — Under RSF siege' },
    { name: 'Port Sudan', lat: 19.6158, lng: 37.2153, description: 'SAF de facto capital' },
    { name: 'Nyala', lat: 12.05, lng: 24.88, description: 'South Darfur — Famine conditions' },
    { name: 'El Geneina', lat: 13.45, lng: 22.45, description: 'West Darfur — Mass atrocities reported' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE CIVIL WAR', color: 'red' },
    'Deaths': { value: 'Tens of thousands', color: 'red' },
    'Displaced': { value: '11.8M+ (9M internal)', color: 'red' },
    'Famine': { value: 'Spreading across Darfur — UN confirmed', color: 'red' },
    'Foreign Involvement': { value: 'Egypt, Saudi, UAE, Russia (Wagner)', color: 'amber' },
    'Aid Access': { value: 'Severely blocked', color: 'red' },
    'USAID': { value: '83% programs cancelled by US', color: 'red' },
  },
  theaters: [
    { name: 'Khartoum', status: 'ACTIVE', lastEvent: 'Urban warfare continues', assessment: 'Capital remains contested between SAF and RSF.' },
    { name: 'Darfur', status: 'ACTIVE', lastEvent: 'El Fasher under RSF siege', assessment: 'Famine conditions spreading. Mass atrocities reported.' },
    { name: 'Eastern Sudan', status: 'TENSE', lastEvent: 'Port Sudan remains SAF-controlled', assessment: 'De facto government seat. Aid corridor.' },
  ],
  watchlist: [
    { label: 'Darfur Famine', status: 'alert', detail: 'UN confirmed — spreading' },
    { label: 'El Fasher Siege', status: 'alert', detail: 'RSF encirclement continues' },
    { label: 'Aid Access', status: 'alert', detail: 'Severely blocked by all parties' },
    { label: 'Wagner/Russia', status: 'warn', detail: 'Mercenary involvement' },
  ],
  timelineEvents: [
    { date: 'Apr 2023', label: 'War erupts', detail: 'SAF and RSF clash in Khartoum', isCritical: true },
    { date: 'Jun 2023', label: 'Darfur massacres', detail: 'RSF attacks on civilians in El Geneina', isCritical: true },
    { date: 'Dec 2023', label: 'Famine declared', detail: 'UN declares famine in parts of Darfur', isCritical: true },
    { date: 'Feb 2026', label: 'Siege continues', detail: 'El Fasher under prolonged RSF siege', isCritical: true },
  ],
  casualtyEstimate: 'Tens of thousands',
  displacedEstimate: '11.8M+',
};

// ─── MYANMAR ────────────────────────────────────────────────────────────────────

const myanmar: ConflictConfig = {
  id: 'myanmar',
  name: 'Myanmar Civil War',
  subtitle: 'Resistance vs Military Junta (Post-2021 Coup)',
  region: 'Southeast Asia',
  status: 'CIVIL WAR',
  statusColor: 'red',
  severity: 'HIGH',
  startDate: '2021-02-01',
  gdeltQuery: 'myanmar civil war OR junta myanmar OR resistance myanmar OR shan state OR rakhine',
  gdeltGeoQuery: 'myanmar OR burma',
  redditSubs: ['worldnews', 'myanmar', 'geopolitics'],
  mapCenter: [19.7633, 96.0785],
  mapZoom: 5,
  keyLocations: [
    { name: 'Naypyidaw', lat: 19.7633, lng: 96.0785, description: 'Junta capital' },
    { name: 'Mandalay', lat: 21.9162, lng: 96.0856, description: 'Central — Contested' },
    { name: 'Myitkyina', lat: 25.3867, lng: 97.3958, description: 'Kachin — Resistance controlled' },
    { name: 'Lashio', lat: 22.9362, lng: 97.75, description: 'Shan — Heavy fighting' },
    { name: 'Sittwe', lat: 20.1461, lng: 92.8987, description: 'Rakhine — Arakan Army advances' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'CIVIL WAR — Junta losing territory', color: 'red' },
    'Junta Control': { value: 'Shrinking — multiple fronts collapsing', color: 'amber' },
    'Resistance': { value: 'PDF + ethnic armed orgs advancing', color: 'green' },
    'Elections': { value: 'Junta planning sham vote — boycotted', color: 'amber' },
    'Displaced': { value: '3M+', color: 'red' },
    'Child Soldiers': { value: 'Both sides accused', color: 'red' },
  },
  theaters: [
    { name: 'Shan State', status: 'ACTIVE', lastEvent: 'Multi-front resistance offensive', assessment: 'Junta losing ground rapidly. Lashio contested.' },
    { name: 'Rakhine', status: 'ACTIVE', lastEvent: 'Arakan Army advances', assessment: 'AA controls most of Rakhine state.' },
    { name: 'Sagaing', status: 'ACTIVE', lastEvent: 'PDF guerrilla operations', assessment: 'Junta control limited to urban centers.' },
    { name: 'Kachin', status: 'TENSE', lastEvent: 'KIA operations continue', assessment: 'Long-running resistance — KIA controls territory.' },
  ],
  watchlist: [
    { label: 'Junta Collapse Risk', status: 'warn', detail: 'Multiple fronts collapsing' },
    { label: 'Sham Elections', status: 'warn', detail: 'Junta planning — widely boycotted' },
    { label: 'Displacement', status: 'alert', detail: '3M+ internally displaced' },
    { label: 'China Influence', status: 'warn', detail: 'Beijing watching closely' },
  ],
  timelineEvents: [
    { date: 'Feb 2021', label: 'Military coup', detail: 'Tatmadaw seizes power from NLD government', isCritical: true },
    { date: 'Mar 2021', label: 'Mass protests', detail: 'Nationwide protests brutally suppressed', isCritical: true },
    { date: 'Oct 2023', label: 'Operation 1027', detail: 'Three Brotherhood Alliance launches major offensive', isCritical: true },
    { date: 'Jan 2024', label: 'Lashio falls', detail: 'Resistance captures major Shan state city', isCritical: true },
    { date: 'Feb 2026', label: 'Junta weakening', detail: 'Multiple fronts collapsing', isCritical: true },
  ],
  displacedEstimate: '3M+',
};

// ─── YEMEN ──────────────────────────────────────────────────────────────────────

const yemen: ConflictConfig = {
  id: 'yemen',
  name: 'Yemen Crisis',
  subtitle: 'Houthi Control, Saudi Coalition, Southern Split',
  region: 'Middle East',
  status: 'CRISIS',
  statusColor: 'amber',
  severity: 'HIGH',
  startDate: '2014-09-21',
  gdeltQuery: 'yemen houthi OR aden crisis OR red sea shipping OR yemen war OR STC yemen',
  gdeltGeoQuery: 'yemen',
  redditSubs: ['worldnews', 'yemen', 'geopolitics'],
  mapCenter: [15.5, 47.0],
  mapZoom: 6,
  keyLocations: [
    { name: 'Sanaa', lat: 15.3694, lng: 44.191, description: 'Houthi-controlled capital' },
    { name: 'Aden', lat: 12.8, lng: 45.03, description: 'Govt seat — STC protests, palace storming attempt' },
    { name: 'Hodeidah', lat: 14.798, lng: 42.954, description: 'Port — Red Sea crisis focal point' },
    { name: 'Marib', lat: 15.46, lng: 45.33, description: 'Government-held — Oil-rich' },
    { name: 'Ras Isa', lat: 15.27, lng: 42.72, description: 'Oil terminal — Israeli strikes Dec 2024' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'FRAGMENTED — Multiple factions', color: 'amber' },
    'Houthi Control': { value: 'North/central Yemen', color: 'amber' },
    'Red Sea Attacks': { value: 'Paused since Gaza ceasefire Oct 2025', color: 'green' },
    'Southern Crisis': { value: 'STC vs govt — Aden protests', color: 'red' },
    'Saudi-UAE': { value: 'Backing opposing factions in south', color: 'amber' },
    'Humanitarian': { value: 'Millions face severe hunger', color: 'red' },
    'Iran Link': { value: 'Arms deliveries reportedly increased', color: 'amber' },
  },
  theaters: [
    { name: 'Houthi North', status: 'TENSE', lastEvent: 'Red Sea attacks paused', assessment: 'Consolidating control. Iran supply lines active.' },
    { name: 'Aden / South', status: 'ACTIVE', lastEvent: 'STC protests and palace storming attempt', assessment: 'Southern separatism growing. Government fragile.' },
    { name: 'Red Sea', status: 'MONITORING', lastEvent: 'Shipping gradually resuming', assessment: 'Paused since Gaza ceasefire but could restart.' },
  ],
  watchlist: [
    { label: 'Red Sea Shipping', status: 'stable', detail: 'Paused since Gaza ceasefire' },
    { label: 'Aden Instability', status: 'alert', detail: 'STC vs government tensions' },
    { label: 'Famine Risk', status: 'alert', detail: 'Millions face severe hunger' },
    { label: 'Iran Arms Shipments', status: 'warn', detail: 'Reportedly increasing' },
  ],
  timelineEvents: [
    { date: 'Sep 2014', label: 'Houthi takeover', detail: 'Houthis seize Sanaa', isCritical: true },
    { date: 'Mar 2015', label: 'Saudi intervention', detail: 'Saudi-led coalition begins airstrikes', isCritical: true },
    { date: 'Nov 2023', label: 'Red Sea attacks begin', detail: 'Houthis attack shipping in solidarity with Gaza', isCritical: true },
    { date: 'Oct 2025', label: 'Red Sea attacks pause', detail: 'Following Gaza ceasefire', isCritical: false },
    { date: 'Feb 2026', label: 'Aden crisis', detail: 'STC protests threaten government', isCritical: true },
  ],
  displacedEstimate: '4.5M+',
};

// ─── SYRIA ──────────────────────────────────────────────────────────────────────

const syria: ConflictConfig = {
  id: 'syria',
  name: 'Syria Transition',
  subtitle: 'Post-Assad Political Transition & Security Challenges',
  region: 'Middle East',
  status: 'CRISIS',
  statusColor: 'amber',
  severity: 'ELEVATED',
  startDate: '2011-03-15',
  gdeltQuery: 'syria transition OR SDF syria OR damascus OR isis syria OR idlib OR HTS syria',
  gdeltGeoQuery: 'syria',
  redditSubs: ['worldnews', 'syriancivilwar', 'geopolitics'],
  mapCenter: [34.8, 38.99],
  mapZoom: 6,
  keyLocations: [
    { name: 'Damascus', lat: 33.5138, lng: 36.2765, description: 'Capital — New government under al-Sharaa' },
    { name: 'Qamishli', lat: 37.05, lng: 41.22, description: 'Kurdish-held — Syrian forces entering after ceasefire' },
    { name: 'Idlib', lat: 35.93, lng: 36.63, description: 'Former HTS stronghold' },
    { name: 'Aleppo', lat: 36.2, lng: 37.16, description: 'Northern — Reconstruction' },
    { name: 'Deir ez-Zor', lat: 35.33, lng: 40.14, description: 'Eastern — ISIS remnants active' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'TRANSITION — Fragile security', color: 'amber' },
    'Government': { value: 'Ahmed al-Sharaa (ex-HTS) leading', color: 'amber' },
    'Kurdish SDF': { value: 'Integration talks — govt forces entering Qamishli', color: 'amber' },
    'ISIS': { value: 'Cells still active in east', color: 'red' },
    'Israel': { value: 'Expanding buffer zone, daily strikes', color: 'red' },
    'Turkey': { value: 'Watching SDF-PKK integration closely', color: 'amber' },
  },
  theaters: [
    { name: 'Northeast / SDF', status: 'TENSE', lastEvent: 'Government forces entering Qamishli', assessment: 'Kurdish integration talks delicate.' },
    { name: 'Eastern Desert', status: 'ACTIVE', lastEvent: 'ISIS cells conducting attacks', assessment: 'Security vacuum in Deir ez-Zor region.' },
    { name: 'Golan / South', status: 'TENSE', lastEvent: 'Israeli buffer zone expansion', assessment: 'Israel conducting daily strikes in Syria.' },
  ],
  watchlist: [
    { label: 'ISIS Resurgence', status: 'alert', detail: 'Cells active in eastern desert' },
    { label: 'SDF Integration', status: 'warn', detail: 'Talks ongoing — could collapse' },
    { label: 'Israeli Strikes', status: 'alert', detail: 'Daily strikes, buffer zone expanding' },
    { label: 'Turkey-SDF Tensions', status: 'warn', detail: 'Turkey watching PKK closely' },
  ],
  timelineEvents: [
    { date: 'Mar 2011', label: 'Uprising begins', detail: 'Syrian civil war starts', isCritical: true },
    { date: 'Dec 2024', label: 'Assad falls', detail: 'Assad regime collapses', isCritical: true },
    { date: 'Jan 2025', label: 'Transition begins', detail: 'Al-Sharaa leads new government', isCritical: true },
    { date: 'Feb 2026', label: 'SDF integration talks', detail: 'Kurdish forces negotiating with Damascus', isCritical: false },
  ],
  displacedEstimate: '6.8M internally, 5.5M refugees',
};

// ─── SAHEL ──────────────────────────────────────────────────────────────────────

const sahel: ConflictConfig = {
  id: 'sahel',
  name: 'Sahel Crisis',
  subtitle: 'Mali & Burkina Faso — Jihadist Insurgency & Junta Rule',
  region: 'West Africa',
  status: 'INSURGENCY',
  statusColor: 'red',
  severity: 'HIGH',
  startDate: '2012-01-16',
  gdeltQuery: 'mali war OR burkina faso attack OR sahel jihadist OR bamako siege OR JNIM',
  gdeltGeoQuery: 'mali OR burkina faso OR sahel',
  redditSubs: ['worldnews', 'africa', 'geopolitics'],
  mapCenter: [14.0, -2.0],
  mapZoom: 5,
  keyLocations: [
    { name: 'Bamako', lat: 12.6392, lng: -8.0029, description: 'Capital — Under partial jihadist blockade' },
    { name: 'Ouagadougou', lat: 12.3714, lng: -1.5197, description: 'Burkina Faso capital — Junta rule' },
    { name: 'Timbuktu', lat: 16.7666, lng: -3.0026, description: 'Northern Mali — Jihadist control' },
    { name: 'Gao', lat: 16.2717, lng: -0.0431, description: 'Eastern Mali — Contested' },
    { name: 'Djibo', lat: 14.1, lng: -1.63, description: 'Burkina Faso — Under siege' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE INSURGENCY — Regime collapse risk', color: 'red' },
    'Mali Capital': { value: 'Bamako under partial jihadist blockade', color: 'red' },
    'Burkina Faso': { value: 'Junta losing control of countryside', color: 'red' },
    'Jihadist Groups': { value: 'JNIM (AQ-linked), ISGS expanding', color: 'red' },
    'Wagner/Africa Corps': { value: 'Russian mercenaries deployed', color: 'amber' },
    'Displaced': { value: 'Millions across region', color: 'red' },
  },
  theaters: [
    { name: 'Northern Mali', status: 'ACTIVE', lastEvent: 'JNIM controls Timbuktu region', assessment: 'Jihadist territorial control expanding.' },
    { name: 'Central Mali', status: 'ACTIVE', lastEvent: 'Attacks on road to Bamako', assessment: 'Capital increasingly isolated.' },
    { name: 'Burkina Faso', status: 'ACTIVE', lastEvent: 'Junta losing rural territory', assessment: 'Djibo under siege. Countryside ungovernable.' },
  ],
  watchlist: [
    { label: 'Bamako Blockade', status: 'alert', detail: 'Capital partially blockaded by JNIM' },
    { label: 'Djibo Siege', status: 'alert', detail: 'Town under extended siege' },
    { label: 'Wagner Presence', status: 'warn', detail: 'Russian mercenaries active' },
    { label: 'Refugee Crisis', status: 'alert', detail: 'Millions displaced across region' },
  ],
  timelineEvents: [
    { date: 'Jan 2012', label: 'Tuareg rebellion', detail: 'Northern Mali rebellion begins', isCritical: true },
    { date: 'Jan 2013', label: 'French intervention', detail: 'Operation Serval pushes back jihadists', isCritical: true },
    { date: 'Aug 2020', label: 'Mali coup', detail: 'Military junta seizes power', isCritical: true },
    { date: 'Sep 2022', label: 'France withdraws', detail: 'French forces leave Mali', isCritical: true },
    { date: 'Feb 2026', label: 'Bamako threatened', detail: 'JNIM advances toward capital', isCritical: true },
  ],
  displacedEstimate: 'Millions across Sahel region',
};

// ─── DRC ────────────────────────────────────────────────────────────────────────

const drc: ConflictConfig = {
  id: 'drc',
  name: 'DRC — Eastern Congo War',
  subtitle: 'M23 Rebellion & Regional Proxy War',
  region: 'Central Africa',
  status: 'ACTIVE COMBAT',
  statusColor: 'red',
  severity: 'HIGH',
  startDate: '2022-03-01',
  gdeltQuery: 'congo M23 OR goma OR DRC war OR rwanda congo OR north kivu',
  gdeltGeoQuery: 'congo OR DRC OR goma',
  redditSubs: ['worldnews', 'africa', 'geopolitics'],
  mapCenter: [-1.67, 29.22],
  mapZoom: 7,
  keyLocations: [
    { name: 'Goma', lat: -1.6794, lng: 29.2217, description: 'Capital of North Kivu — M23 threat' },
    { name: 'Bukavu', lat: -2.5083, lng: 28.8608, description: 'South Kivu — Instability' },
    { name: 'Beni', lat: 0.49, lng: 29.47, description: 'ADF (ISIS-linked) attacks' },
    { name: 'Butembo', lat: 0.13, lng: 29.29, description: 'North Kivu — Displacement' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE — M23 offensive + proxy war', color: 'red' },
    'M23 (Rwanda-backed)': { value: 'Advancing toward Goma', color: 'red' },
    'Rwanda': { value: 'Denied but proven military support to M23', color: 'red' },
    'ADF/ISIS': { value: 'Active in Beni area', color: 'red' },
    'Displaced': { value: '7M+ in eastern DRC', color: 'red' },
    'Humanitarian': { value: 'Worst crisis in Africa', color: 'red' },
  },
  theaters: [
    { name: 'North Kivu / Goma', status: 'ACTIVE', lastEvent: 'M23 advancing on Goma', assessment: 'Major humanitarian crisis. Rwanda-backed offensive.' },
    { name: 'Beni / ADF', status: 'ACTIVE', lastEvent: 'ISIS-linked ADF attacks', assessment: 'Ongoing attacks on civilians.' },
    { name: 'South Kivu', status: 'TENSE', lastEvent: 'Instability spreading south', assessment: 'Multiple armed groups active.' },
  ],
  watchlist: [
    { label: 'Goma', status: 'alert', detail: 'M23 advancing on city' },
    { label: 'Rwanda Involvement', status: 'alert', detail: 'Proven military support to M23' },
    { label: 'Displacement', status: 'alert', detail: '7M+ displaced in eastern DRC' },
    { label: 'ADF/ISIS', status: 'warn', detail: 'Attacks continuing in Beni area' },
  ],
  timelineEvents: [
    { date: 'Mar 2022', label: 'M23 resurgence', detail: 'M23 launches new offensive in North Kivu', isCritical: true },
    { date: 'Nov 2022', label: 'M23 nears Goma', detail: 'First major advance on provincial capital', isCritical: true },
    { date: 'Feb 2024', label: 'UN withdraws', detail: 'MONUSCO peacekeepers begin withdrawal', isCritical: true },
    { date: 'Feb 2026', label: 'Offensive continues', detail: 'M23 advancing with Rwandan support', isCritical: true },
  ],
  displacedEstimate: '7M+ in eastern DRC',
};

// ─── HAITI ──────────────────────────────────────────────────────────────────────

const haiti: ConflictConfig = {
  id: 'haiti',
  name: 'Haiti Crisis',
  subtitle: 'Gang Control & State Collapse',
  region: 'Caribbean',
  status: 'CRISIS',
  statusColor: 'red',
  severity: 'HIGH',
  startDate: '2024-02-29',
  gdeltQuery: 'haiti gang OR port au prince OR haiti crisis OR haiti violence',
  gdeltGeoQuery: 'haiti',
  redditSubs: ['worldnews', 'haiti', 'geopolitics'],
  mapCenter: [18.97, -72.33],
  mapZoom: 8,
  keyLocations: [
    { name: 'Port-au-Prince', lat: 18.5944, lng: -72.3074, description: 'Capital — 80%+ under gang control' },
    { name: 'Cap-Haitien', lat: 19.7577, lng: -72.2044, description: 'Northern — Relatively stable' },
    { name: 'Artibonite', lat: 19.17, lng: -72.42, description: 'Agricultural region — Gang expansion' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'STATE COLLAPSE — Gang rule', color: 'red' },
    'Gang Control': { value: '80%+ of Port-au-Prince', color: 'red' },
    'Government': { value: 'Transitional council — minimal authority', color: 'red' },
    'UN/Kenya Force': { value: 'Deployed but outgunned', color: 'amber' },
    'Displaced': { value: '700K+', color: 'red' },
  },
  theaters: [
    { name: 'Port-au-Prince', status: 'ACTIVE', lastEvent: 'Gang control 80%+ of capital', assessment: 'State effectively collapsed. Gangs control most territory.' },
    { name: 'Artibonite', status: 'TENSE', lastEvent: 'Gang expansion into rural areas', assessment: 'Agricultural region threatened.' },
  ],
  watchlist: [
    { label: 'Gang Control', status: 'alert', detail: '80%+ of capital under gang rule' },
    { label: 'UN/Kenya Force', status: 'warn', detail: 'Deployed but outgunned' },
    { label: 'Displacement', status: 'alert', detail: '700K+ displaced' },
    { label: 'State Collapse', status: 'alert', detail: 'Government has minimal authority' },
  ],
  timelineEvents: [
    { date: 'Jul 2021', label: 'President assassinated', detail: 'Moïse assassinated at residence', isCritical: true },
    { date: 'Feb 2024', label: 'Gang uprising', detail: 'Coordinated gang assault on state institutions', isCritical: true },
    { date: 'Jun 2024', label: 'Kenya force arrives', detail: 'UN-backed Kenyan security mission deployed', isCritical: false },
    { date: 'Feb 2026', label: 'State collapse deepens', detail: 'Gangs expand control beyond capital', isCritical: true },
  ],
  displacedEstimate: '700K+',
};

// ─── VENEZUELA ──────────────────────────────────────────────────────────────────

const venezuela: ConflictConfig = {
  id: 'venezuela',
  name: 'Venezuela Crisis',
  subtitle: 'U.S. Military Pressure & Regime Standoff',
  region: 'South America',
  status: 'ESCALATING',
  statusColor: 'amber',
  severity: 'ELEVATED',
  startDate: '2025-01-01',
  gdeltQuery: 'venezuela maduro OR caracas OR US venezuela military OR caribbean strikes',
  gdeltGeoQuery: 'venezuela',
  redditSubs: ['worldnews', 'venezuela', 'geopolitics'],
  mapCenter: [8.0, -66.0],
  mapZoom: 6,
  keyLocations: [
    { name: 'Caracas', lat: 10.4806, lng: -66.9036, description: 'Capital — Maduro regime' },
    { name: 'Maracaibo', lat: 10.6427, lng: -71.6125, description: 'Oil region' },
    { name: 'Isla de Margarita', lat: 11.0, lng: -63.9, description: 'Caribbean — US naval activity' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ESCALATING — US military pressure', color: 'amber' },
    'US Actions': { value: 'Strikes on fishing boats, 100+ killed', color: 'red' },
    'Regime': { value: 'Maduro still in power', color: 'amber' },
    'Opposition': { value: 'Machado in exile', color: 'amber' },
    'Refugee Crisis': { value: '7.7M+ fled since 2014', color: 'red' },
  },
  theaters: [
    { name: 'Caribbean Sea', status: 'TENSE', lastEvent: 'US naval activity', assessment: 'Military pressure campaign ongoing.' },
    { name: 'Venezuela Internal', status: 'MONITORING', lastEvent: 'Regime crackdown on opposition', assessment: 'Maduro consolidating power.' },
  ],
  watchlist: [
    { label: 'US Military Action', status: 'warn', detail: 'Strikes reported on fishing boats' },
    { label: 'Refugee Crisis', status: 'alert', detail: '7.7M+ fled since 2014' },
    { label: 'Maduro Regime', status: 'warn', detail: 'Consolidating power despite pressure' },
  ],
  timelineEvents: [
    { date: 'Jul 2024', label: 'Disputed election', detail: 'Maduro claims victory amid fraud allegations', isCritical: true },
    { date: 'Jan 2025', label: 'US pressure increases', detail: 'Military threats escalate', isCritical: true },
    { date: 'Feb 2026', label: 'Caribbean tensions', detail: 'US naval activity around Venezuela', isCritical: false },
  ],
  displacedEstimate: '7.7M+ refugees/migrants since 2014',
};

// ─── ETHIOPIA ───────────────────────────────────────────────────────────────────

const ethiopia: ConflictConfig = {
  id: 'ethiopia',
  name: 'Ethiopia — Amhara Insurgency',
  subtitle: 'Post-Tigray Instability & Fano Rebellion',
  region: 'East Africa',
  status: 'INSURGENCY',
  statusColor: 'amber',
  severity: 'ELEVATED',
  startDate: '2023-04-01',
  gdeltQuery: 'ethiopia amhara OR fano militia OR ethiopia conflict OR addis ababa',
  gdeltGeoQuery: 'ethiopia',
  redditSubs: ['worldnews', 'ethiopia', 'Africa'],
  mapCenter: [9.1, 40.5],
  mapZoom: 5,
  keyLocations: [
    { name: 'Addis Ababa', lat: 9.0192, lng: 38.7525, description: 'Capital' },
    { name: 'Bahir Dar', lat: 11.5742, lng: 37.3614, description: 'Amhara capital — Fano stronghold' },
    { name: 'Gondar', lat: 12.6, lng: 37.47, description: 'Amhara — Active fighting' },
    { name: 'Mekelle', lat: 13.4967, lng: 39.4753, description: 'Tigray capital — Post-war recovery' },
  ],
  situationStatus: {
    'Conflict Status': { value: 'ACTIVE INSURGENCY', color: 'red' },
    'Fano Militia': { value: 'Controlling parts of Amhara region', color: 'red' },
    'Tigray': { value: 'Ceasefire holding but humanitarian crisis', color: 'amber' },
    'Oromia': { value: 'OLA insurgency ongoing', color: 'amber' },
  },
  theaters: [
    { name: 'Amhara Region', status: 'ACTIVE', lastEvent: 'Fano militia controlling territory', assessment: 'Insurgency expanding. Government struggling to respond.' },
    { name: 'Tigray', status: 'MONITORING', lastEvent: 'Ceasefire holding', assessment: 'Post-war recovery. Humanitarian needs massive.' },
    { name: 'Oromia', status: 'TENSE', lastEvent: 'OLA insurgency ongoing', assessment: 'Low-level insurgency continues.' },
  ],
  watchlist: [
    { label: 'Fano Insurgency', status: 'alert', detail: 'Expanding in Amhara region' },
    { label: 'Tigray Recovery', status: 'warn', detail: 'Ceasefire holding but fragile' },
    { label: 'OLA / Oromia', status: 'warn', detail: 'Insurgency ongoing' },
  ],
  timelineEvents: [
    { date: 'Nov 2020', label: 'Tigray war begins', detail: 'Federal forces attack Tigray', isCritical: true },
    { date: 'Nov 2022', label: 'Tigray ceasefire', detail: 'Pretoria peace agreement signed', isCritical: true },
    { date: 'Apr 2023', label: 'Amhara insurgency', detail: 'Fano militia launches rebellion', isCritical: true },
    { date: 'Feb 2026', label: 'Fano expanding', detail: 'Insurgency controls Amhara territory', isCritical: true },
  ],
  displacedEstimate: '4.6M+ internally displaced across Ethiopia',
};

// ─── MASTER CONFLICT MAP ────────────────────────────────────────────────────────

export const CONFLICTS: Record<ConflictId, ConflictConfig> = {
  iran,
  ukraine,
  gaza,
  sudan,
  myanmar,
  yemen,
  syria,
  sahel,
  drc,
  haiti,
  venezuela,
  ethiopia,
};

export const CONFLICT_LIST: ConflictConfig[] = Object.values(CONFLICTS);

export const DEFAULT_CONFLICT: ConflictId = 'iran';
