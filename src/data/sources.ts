import type { SourceInfo } from '../types';

export const allSources: SourceInfo[] = [
  // Wire Services
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'Wire Service', bias: 'Neutral', country: 'UK', type: 'Website', status: 'Live', description: 'International wire service, gold standard for factual breaking news' },
  { name: 'Associated Press', url: 'https://apnews.com', category: 'Wire Service', bias: 'Neutral', country: 'USA', type: 'Website', status: 'Live', description: 'Non-profit wire service, widely cited, minimal editorial bias' },
  { name: 'AFP', url: 'https://www.afp.com', category: 'Wire Service', bias: 'Neutral', country: 'France', type: 'Website', status: 'Live', description: 'French wire service, strong Middle East bureau coverage' },

  // Live Blogs
  { name: 'Al Jazeera Live Blog', url: 'https://www.aljazeera.com', category: 'Live Blog', bias: 'Regional', country: 'Qatar', type: 'Live Blog', status: 'Live', description: 'Qatar-funded, extensive on-ground correspondents in the region' },
  { name: 'BBC Live Blog', url: 'https://www.bbc.com/news', category: 'Live Blog', bias: 'Western', country: 'UK', type: 'Live Blog', status: 'Live', description: 'British public broadcaster, generally balanced western perspective' },
  { name: 'CNN Live Updates', url: 'https://www.cnn.com', category: 'Live Blog', bias: 'Western', country: 'USA', type: 'Live Blog', status: 'Live', description: 'US cable news, strong Pentagon and State Dept sources' },
  { name: 'NBC News', url: 'https://www.nbcnews.com', category: 'Live Blog', bias: 'Western', country: 'USA', type: 'Live Blog', status: 'Active', description: 'US broadcast network, strong investigative reporting' },
  { name: 'CBS News', url: 'https://www.cbsnews.com', category: 'Live Blog', bias: 'Western', country: 'USA', type: 'Live Blog', status: 'Active', description: 'US broadcast network news division' },
  { name: 'The Guardian', url: 'https://www.theguardian.com', category: 'Live Blog', bias: 'Western', country: 'UK', type: 'Live Blog', status: 'Live', description: 'British broadsheet, progressive editorial stance' },
  { name: 'The New Arab', url: 'https://www.newarab.com', category: 'Live Blog', bias: 'Regional', country: 'UK/Qatar', type: 'Live Blog', status: 'Active', description: 'Pan-Arab news outlet based in London' },
  { name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'Live Blog', bias: 'Western', country: 'USA', type: 'Live Blog', status: 'Live', description: 'US broadsheet, strong national security reporting' },
  { name: 'New York Times', url: 'https://www.nytimes.com', category: 'Live Blog', bias: 'Western', country: 'USA', type: 'Live Blog', status: 'Live', description: 'US paper of record, extensive foreign correspondent network' },

  // Middle East & Regional
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com', category: 'Middle East & Regional', bias: 'Regional', country: 'Qatar', type: 'Website', status: 'Live', description: 'Qatar state-funded, largest Arabic news network globally' },
  { name: 'Middle East Eye', url: 'https://www.middleeasteye.net', category: 'Middle East & Regional', bias: 'Regional', country: 'UK', type: 'Website', status: 'Active', description: 'London-based, covers Middle East from regional perspective' },
  { name: 'Arab News', url: 'https://www.arabnews.com', category: 'Middle East & Regional', bias: 'Regional', country: 'Saudi Arabia', type: 'Website', status: 'Active', description: 'Saudi-owned English-language daily' },
  { name: 'Times of Israel', url: 'https://www.timesofisrael.com', category: 'Middle East & Regional', bias: 'Israeli', country: 'Israel', type: 'Website', status: 'Live', description: 'Israeli news site, English language, centrist Israeli perspective' },
  { name: 'Haaretz', url: 'https://www.haaretz.com', category: 'Middle East & Regional', bias: 'Israeli', country: 'Israel', type: 'Website', status: 'Active', description: 'Israeli broadsheet, left-leaning, critical of government' },
  { name: 'The National', url: 'https://www.thenationalnews.com', category: 'Middle East & Regional', bias: 'Regional', country: 'UAE', type: 'Website', status: 'Active', description: 'Abu Dhabi state-owned English-language newspaper' },
  { name: 'TRT World', url: 'https://www.trtworld.com', category: 'Middle East & Regional', bias: 'Regional', country: 'Turkey', type: 'Website', status: 'Active', description: 'Turkish state broadcaster, English-language international service' },

  // Independent & Diaspora
  { name: 'Iran International', url: 'https://www.iranintl.com', category: 'Independent & Diaspora', bias: 'Opposition', country: 'UK', type: 'Website', status: 'Live', description: 'London-based Persian/English, critical of Iranian regime' },
  { name: 'IranWire', url: 'https://iranwire.com', category: 'Independent & Diaspora', bias: 'Opposition', country: 'UK', type: 'Website', status: 'Active', description: 'Independent journalism platform covering Iran' },
  { name: '+972 Magazine', url: 'https://www.972mag.com', category: 'Independent & Diaspora', bias: 'Independent', country: 'Israel/Palestine', type: 'Website', status: 'Active', description: 'Independent Israeli-Palestinian journalism' },
  { name: 'The Intercept', url: 'https://theintercept.com', category: 'Independent & Diaspora', bias: 'Independent', country: 'USA', type: 'Website', status: 'Active', description: 'Investigative journalism, strong national security reporting' },
  { name: 'Mondoweiss', url: 'https://mondoweiss.net', category: 'Independent & Diaspora', bias: 'Independent', country: 'USA', type: 'Website', status: 'Active', description: 'Independent news on Palestine/Israel and US policy' },
  { name: 'CNBC', url: 'https://www.cnbc.com', category: 'Independent & Diaspora', bias: 'Western', country: 'USA', type: 'Website', status: 'Active', description: 'Business news, covers market impact of geopolitics' },
  { name: 'Fortune', url: 'https://fortune.com', category: 'Independent & Diaspora', bias: 'Western', country: 'USA', type: 'Website', status: 'Active', description: 'Business magazine, economic and corporate perspective' },

  // YouTube Live Streams
  { name: 'Al Jazeera English (YouTube)', url: 'https://www.youtube.com/c/AlJazeeraEnglish', category: 'YouTube Live', bias: 'Regional', country: 'Qatar', type: 'YouTube', status: 'Live', description: 'Qatar-funded, correspondent on ground in Tehran' },
  { name: 'Sky News (YouTube)', url: 'https://www.youtube.com/c/skynews', category: 'YouTube Live', bias: 'Western', country: 'UK', type: 'YouTube', status: 'Live', description: 'British 24-hour news, strong Middle East desk' },
  { name: 'France 24 (YouTube)', url: 'https://www.youtube.com/c/FRANCE24English', category: 'YouTube Live', bias: 'Western', country: 'France', type: 'YouTube', status: 'Live', description: 'French state international news, multi-perspective' },
  { name: 'DW News (YouTube)', url: 'https://www.youtube.com/c/DWNews', category: 'YouTube Live', bias: 'Western', country: 'Germany', type: 'YouTube', status: 'Live', description: 'German state international broadcaster' },
  { name: 'Iran International TV (YouTube)', url: 'https://www.youtube.com/c/IranIntlTV', category: 'YouTube Live', bias: 'Opposition', country: 'UK', type: 'YouTube', status: 'Live', description: 'London-based, Persian-language opposition broadcast' },
  { name: 'BBC News 24 (YouTube)', url: 'https://www.youtube.com/c/BBCNews', category: 'YouTube Live', bias: 'Western', country: 'UK', type: 'YouTube', status: 'Live', description: 'British public broadcaster 24-hour news' },
  { name: 'ABC News (YouTube)', url: 'https://www.youtube.com/c/ABCNews', category: 'YouTube Live', bias: 'Western', country: 'USA', type: 'YouTube', status: 'Live', description: 'US broadcast network news' },
  { name: 'WION India (YouTube)', url: 'https://www.youtube.com/c/WIONews', category: 'YouTube Live', bias: 'Regional', country: 'India', type: 'YouTube', status: 'Live', description: 'Indian international news, non-western perspective' },
  { name: 'TRT World (YouTube)', url: 'https://www.youtube.com/c/TRTWorld', category: 'YouTube Live', bias: 'Regional', country: 'Turkey', type: 'YouTube', status: 'Active', description: 'Turkish state international broadcaster' },
  { name: 'i24NEWS Israel (YouTube)', url: 'https://www.youtube.com/c/i24NEWS', category: 'YouTube Live', bias: 'Israeli', country: 'Israel', type: 'YouTube', status: 'Live', description: 'Israeli 24-hour news, strong security analysis' },
  { name: 'Press TV Iran (YouTube)', url: 'https://www.youtube.com/c/PressTVIran', category: 'YouTube Live', bias: 'State', country: 'Iran', type: 'YouTube', status: 'Active', description: 'Iranian state English-language broadcaster' },

  // OSINT & Tools
  { name: 'Liveuamap Iran', url: 'https://iran.liveuamap.com', category: 'OSINT & Tools', bias: 'OSINT', country: 'Ukraine', type: 'OSINT Tool', status: 'Live', description: 'Crowdsourced conflict map with real-time incident tracking' },
  { name: 'Iran Monitor', url: 'https://iranmonitor.org', category: 'OSINT & Tools', bias: 'OSINT', country: 'International', type: 'OSINT Tool', status: 'Active', description: 'OSINT aggregation focused on Iran military activity' },
  { name: 'NetBlocks', url: 'https://netblocks.org', category: 'OSINT & Tools', bias: 'OSINT', country: 'UK', type: 'OSINT Tool', status: 'Live', description: 'Internet censorship and connectivity monitoring' },
  { name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov', category: 'OSINT & Tools', bias: 'OSINT', country: 'USA', type: 'OSINT Tool', status: 'Live', description: 'Satellite fire/hotspot detection, can indicate strikes' },
  { name: 'Flightradar24', url: 'https://www.flightradar24.com', category: 'OSINT & Tools', bias: 'OSINT', country: 'Sweden', type: 'OSINT Tool', status: 'Live', description: 'Flight tracking, useful for monitoring airspace closures' },
  { name: 'MarineTraffic', url: 'https://www.marinetraffic.com', category: 'OSINT & Tools', bias: 'OSINT', country: 'Greece', type: 'OSINT Tool', status: 'Live', description: 'Ship tracking for Strait of Hormuz naval activity' },
  { name: 'ACLED', url: 'https://acleddata.com', category: 'OSINT & Tools', bias: 'OSINT', country: 'USA', type: 'OSINT Tool', status: 'Active', description: 'Armed conflict location and event data project' },
  { name: 'Bellingcat', url: 'https://www.bellingcat.com', category: 'OSINT & Tools', bias: 'OSINT', country: 'Netherlands', type: 'OSINT Tool', status: 'Active', description: 'Investigative OSINT journalism collective' },

  // State & Government Media
  { name: 'IRNA', url: 'https://en.irna.ir', category: 'State Media', bias: 'State', country: 'Iran', type: 'Website', status: 'Active', description: 'Islamic Republic News Agency, official Iranian state wire' },
  { name: 'Press TV', url: 'https://www.presstv.ir', category: 'State Media', bias: 'State', country: 'Iran', type: 'Website', status: 'Active', description: 'Iranian state English-language 24hr news network' },
  { name: 'Fars News', url: 'https://www.farsnews.ir/en', category: 'State Media', bias: 'State', country: 'Iran', type: 'Website', status: 'Active', description: 'Semi-official, linked to IRGC, Iranian hardline perspective' },
  { name: 'Tasnim News', url: 'https://www.tasnimnews.com/en', category: 'State Media', bias: 'State', country: 'Iran', type: 'Website', status: 'Active', description: 'IRGC-affiliated, primary source for Iranian military statements' },
  { name: 'IDF Official', url: 'https://www.idf.il', category: 'State Media', bias: 'Israeli', country: 'Israel', type: 'Website', status: 'Live', description: 'Israel Defense Forces official communications' },

  // Think Tanks & Analysis
  { name: 'ISW', url: 'https://www.understandingwar.org', category: 'Think Tank', bias: 'Western', country: 'USA', type: 'Think Tank', status: 'Active', description: 'Institute for the Study of War, detailed battlefield assessments' },
  { name: 'International Crisis Group', url: 'https://www.crisisgroup.org', category: 'Think Tank', bias: 'Neutral', country: 'Belgium', type: 'Think Tank', status: 'Active', description: 'Independent conflict prevention and resolution analysis' },
  { name: 'Council on Foreign Relations', url: 'https://www.cfr.org', category: 'Think Tank', bias: 'Western', country: 'USA', type: 'Think Tank', status: 'Active', description: 'US foreign policy think tank, establishment perspective' },
  { name: 'Bellingcat (Analysis)', url: 'https://www.bellingcat.com', category: 'Think Tank', bias: 'OSINT', country: 'Netherlands', type: 'Think Tank', status: 'Active', description: 'Open source investigation and verification' },
  { name: 'RUSI', url: 'https://www.rusi.org', category: 'Think Tank', bias: 'Western', country: 'UK', type: 'Think Tank', status: 'Active', description: 'Royal United Services Institute, UK defense and security' },
  { name: 'Quincy Institute', url: 'https://quincyinst.org', category: 'Think Tank', bias: 'Independent', country: 'USA', type: 'Think Tank', status: 'Active', description: 'Advocates diplomatic engagement and restraint' },
  { name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org', category: 'Think Tank', bias: 'Western', country: 'USA', type: 'Think Tank', status: 'Active', description: 'Transatlantic policy think tank, strong Iran coverage' },

  // Twitter/X Accounts
  { name: '@Reuters', url: 'https://twitter.com/Reuters', category: 'Twitter/X', bias: 'Neutral', country: 'UK', type: 'Twitter', status: 'Live', description: 'Reuters breaking news', twitterHandle: 'Reuters' },
  { name: '@AP', url: 'https://twitter.com/AP', category: 'Twitter/X', bias: 'Neutral', country: 'USA', type: 'Twitter', status: 'Live', description: 'Associated Press breaking news', twitterHandle: 'AP' },
  { name: '@AJEnglish', url: 'https://twitter.com/AJEnglish', category: 'Twitter/X', bias: 'Regional', country: 'Qatar', type: 'Twitter', status: 'Live', description: 'Al Jazeera English official', twitterHandle: 'AJEnglish' },
  { name: '@BBCBreaking', url: 'https://twitter.com/BBCBreaking', category: 'Twitter/X', bias: 'Western', country: 'UK', type: 'Twitter', status: 'Live', description: 'BBC Breaking News', twitterHandle: 'BBCBreaking' },
  { name: '@IranIntl_En', url: 'https://twitter.com/IranIntl_En', category: 'Twitter/X', bias: 'Opposition', country: 'UK', type: 'Twitter', status: 'Live', description: 'Iran International English', twitterHandle: 'IranIntl_En' },
  { name: '@sentdefender', url: 'https://twitter.com/sentdefender', category: 'Twitter/X', bias: 'OSINT', country: 'USA', type: 'Twitter', status: 'Live', description: 'OSINT Defender, real-time conflict updates', twitterHandle: 'sentdefender' },
  { name: '@OSINTWarfare', url: 'https://twitter.com/OSINTWarfare', category: 'Twitter/X', bias: 'OSINT', country: 'International', type: 'Twitter', status: 'Active', description: 'OSINT warfare tracking account', twitterHandle: 'OSINTWarfare' },
  { name: '@Osint613', url: 'https://twitter.com/Osint613', category: 'Twitter/X', bias: 'OSINT', country: 'Israel', type: 'Twitter', status: 'Active', description: 'Israel-focused OSINT tracker', twitterHandle: 'Osint613' },
  { name: '@netblocks', url: 'https://twitter.com/netblocks', category: 'Twitter/X', bias: 'OSINT', country: 'UK', type: 'Twitter', status: 'Live', description: 'Internet connectivity monitor', twitterHandle: 'netblocks' },
  { name: '@TheStudyofWar', url: 'https://twitter.com/TheStudyofWar', category: 'Twitter/X', bias: 'Western', country: 'USA', type: 'Twitter', status: 'Active', description: 'Institute for the Study of War official', twitterHandle: 'TheStudyofWar' },
  { name: '@Joyce_Karam', url: 'https://twitter.com/Joyce_Karam', category: 'Twitter/X', bias: 'Independent', country: 'USA/Lebanon', type: 'Twitter', status: 'Active', description: 'Journalist covering Middle East policy', twitterHandle: 'Joyce_Karam' },
  { name: '@BarakRavid', url: 'https://twitter.com/BarakRavid', category: 'Twitter/X', bias: 'Israeli', country: 'Israel', type: 'Twitter', status: 'Active', description: 'Axios reporter, Israeli diplomatic sources', twitterHandle: 'BarakRavid' },
  { name: '@NatashaBertrand', url: 'https://twitter.com/NatashaBertrand', category: 'Twitter/X', bias: 'Western', country: 'USA', type: 'Twitter', status: 'Active', description: 'CNN Pentagon/Intelligence reporter', twitterHandle: 'NatashaBertrand' },
  { name: '@JackDetsch', url: 'https://twitter.com/JackDetsch', category: 'Twitter/X', bias: 'Western', country: 'USA', type: 'Twitter', status: 'Active', description: 'Foreign Policy Pentagon reporter', twitterHandle: 'JackDetsch' },
  { name: '@Ali_Vaez', url: 'https://twitter.com/Ali_Vaez', category: 'Twitter/X', bias: 'Independent', country: 'USA/Iran', type: 'Twitter', status: 'Active', description: 'International Crisis Group Iran director', twitterHandle: 'Ali_Vaez' },
  { name: '@AzadehMoaveni', url: 'https://twitter.com/AzadehMoaveni', category: 'Twitter/X', bias: 'Independent', country: 'UK/Iran', type: 'Twitter', status: 'Active', description: 'Author and journalist covering Iran', twitterHandle: 'AzadehMoaveni' },
  { name: '@IranWire', url: 'https://twitter.com/IranWire', category: 'Twitter/X', bias: 'Opposition', country: 'UK', type: 'Twitter', status: 'Active', description: 'IranWire independent journalism', twitterHandle: 'IranWire' },

  // Subreddits
  { name: 'r/iran', url: 'https://www.reddit.com/r/iran', category: 'Subreddit', bias: 'Independent', country: 'International', type: 'Subreddit', status: 'Active', description: 'Iran subreddit, diaspora-heavy, opposition-leaning' },
  { name: 'r/worldnews', url: 'https://www.reddit.com/r/worldnews', category: 'Subreddit', bias: 'Neutral', country: 'International', type: 'Subreddit', status: 'Live', description: 'Major subreddit for international news aggregation' },
  { name: 'r/geopolitics', url: 'https://www.reddit.com/r/geopolitics', category: 'Subreddit', bias: 'Neutral', country: 'International', type: 'Subreddit', status: 'Active', description: 'Academic-leaning geopolitical discussion' },
  { name: 'r/OSINT', url: 'https://www.reddit.com/r/OSINT', category: 'Subreddit', bias: 'OSINT', country: 'International', type: 'Subreddit', status: 'Active', description: 'Open source intelligence community' },
  { name: 'r/IranConflict', url: 'https://www.reddit.com/r/IranConflict', category: 'Subreddit', bias: 'Independent', country: 'International', type: 'Subreddit', status: 'Active', description: 'Dedicated subreddit for the Iran conflict' },
];

export const biasColors: Record<string, string> = {
  'Neutral': '#16A34A',
  'Western': '#2563EB',
  'Regional': '#D97706',
  'State': '#DC2626',
  'Independent': '#0D9488',
  'OSINT': '#7C3AED',
  'Israeli': '#2563EB',
  'Opposition': '#0D9488',
};
